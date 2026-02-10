/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { SignInDto } from './dto/sing-in.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { StoreService } from 'src/store/store.service';
import { CartService } from 'src/cart/cart.service';
import { ConfigService } from '@nestjs/config';
import { VerificationCode } from './entities/verification-code.entity';
import { SmsService } from 'src/notifications/sms.service';
import {
  parsePhoneNumberWithError,
  isValidPhoneNumber,
} from 'libphonenumber-js';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly jwtService: JwtService,
    private readonly cartService: CartService,
    private readonly storeService: StoreService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    const { password, code } = createUserDto;
    const phoneRaw = createUserDto.phone;

    const phone = parsePhoneNumberWithError(
      phoneRaw,
      'UA',
    ).formatInternational();

    await this.verifyCode(phone, code);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      password: hashedPassword,
      phone,
      imagePath: this.configService.get('DEFAULT_USER_PFP') as string,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      await this.cartService.create(savedUser);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`User already exists {phone: ${phone}}`);
        throw new ConflictException('This user already exists');
      } else {
        this.logger.error(`Failed to register a user: ${error.stack}`);
        throw new InternalServerErrorException('Failed to register a user');
      }
    }
  }

  async requestRegistrationCode(phoneRaw: string): Promise<void> {
    const phone = parsePhoneNumberWithError(
      phoneRaw,
      'UA',
    ).formatInternational();

    this.logger.verbose(
      `Requesting a verification code for number '${phone}'...`,
    );

    const existingUser = await this.userRepository.findOne({
      where: { phone },
    });

    if (existingUser) {
      this.logger.error(`Phone number is already registered {phone: ${phone}}`);
      throw new ConflictException('This phone number is already registered');
    }

    const rawCode = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(rawCode, 10);

    await this.verificationCodeRepository.delete({ phone });

    await this.verificationCodeRepository.save({
      phone,
      code: hashedCode,
    });

    if (this.configService.get<string>('NODE_ENV') !== 'prod') {
      this.smsService.sendVerificationCodeMock(phone, rawCode);
    } else {
      await this.smsService.sendVerificationCode(phone, rawCode);
    }
  }

  private async verifyCode(phone: string, code: string): Promise<void> {
    const record = await this.verificationCodeRepository.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      throw new BadRequestException('No verification code found');
    }

    const minutesOld = (Date.now() - record.createdAt.getTime()) / 1000 / 60;
    const expiresIn =
      this.configService.get<number>('VERIFICATION_CODE_EXPIRE_MINUTES') || 5;

    if (minutesOld > expiresIn) {
      await this.verificationCodeRepository.delete({ phone });
      throw new BadRequestException('Code expired');
    }

    const isMatch = await bcrypt.compare(code, record.code);
    if (!isMatch) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.verificationCodeRepository.delete({ phone });

    this.logger.verbose(`Verification code accepted for '${phone}'`);
  }

  async signIn(
    signInDto: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const password = signInDto.password;
    const loginRaw = signInDto.login;

    let login = loginRaw;

    if (isValidPhoneNumber(loginRaw, 'UA')) {
      login = parsePhoneNumberWithError(loginRaw, 'UA').formatInternational();
    }

    const user = await this.userRepository.findOneBy([
      { phone: login },
      { email: login },
    ]);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        sub: user.id,
        login,
        isAdmin: user.isAdmin,
      };
      const tokens = await this.getTokens(payload);

      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } else {
      this.logger.error(`Wrong login or password {login: ${login}}`);
      throw new UnauthorizedException('Wrong login or password!');
    }
  }

  private async getTokens(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRE_TIME') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRE_TIME') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshToken: hash });
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatches) throw new UnauthorizedException('Access denied');

    const payload: JwtPayload = {
      sub: user.id,
      login: user.phone,
      isAdmin: user.isAdmin,
    };

    const tokens = await this.getTokens(payload);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async chooseStore(user: User, storeId: number): Promise<void> {
    const store = await this.storeService.findOne(storeId);

    if (!store.isActive) {
      this.logger.error(`Store with ID ${storeId} is not active`);
      throw new Error(`Store is not active`);
    }

    user.selectedStore = store;

    try {
      await this.userRepository.save(user);
      await this.cartService.clearCart(user.id);
    } catch (error) {
      this.logger.error(
        `Failed to asign a store {userId: ${user.id}, storeId: ${storeId}}: ${error.stack}`,
      );
      throw new InternalServerErrorException('Failed to asign a store');
    }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      this.logger.error(`User with ID ${id} not found`);
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const password = updateUserDto.password;
    const phoneRaw = updateUserDto.phone;
    const email = updateUserDto.email;

    const isSensitiveUpdate = password || email || phoneRaw;

    if (isSensitiveUpdate) {
      if (!updateUserDto.currentPassword) {
        this.logger.error(`No current password provided {userId: ${id}}`);
        throw new BadRequestException(
          'Current password is required to change sensitive data',
        );
      }

      const isMatch = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.password,
      );
      if (!isMatch) {
        this.logger.error(`Wrong current password {userId: ${id}}`);
        throw new UnauthorizedException('Wrong current password');
      }
    }

    delete updateUserDto.currentPassword;

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      updateUserDto.password = hashedPassword;
    }

    if (phoneRaw) {
      const newPhone = parsePhoneNumberWithError(
        phoneRaw,
        'UA',
      ).formatInternational();

      const sameUser = await this.userRepository.findOneBy({
        phone: newPhone,
      });

      this.logger.error(`User with phone '${newPhone}' already exists`);
      if (sameUser) throw new ConflictException('This phone is already in use');

      if (!updateUserDto.code) {
        this.logger.error(
          `No verification code provided for number '${newPhone}'`,
        );
        throw new BadRequestException('No verification code provided');
      }

      await this.verifyCode(newPhone, updateUserDto.code);
      updateUserDto.phone = newPhone;
    }

    if (email) {
      const sameUser = await this.userRepository.findOne({ where: { email } });

      if (sameUser) {
        this.logger.error(`User with email '${email}' already exists`);
        throw new ConflictException('A user with this email already exists');
      }
    }

    try {
      this.userRepository.merge(user, updateUserDto);
      return this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Failed to update a user: ${error.stack}`);
      throw new InternalServerErrorException('Failed to update a user');
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      this.logger.error(`User with ID ${id} not found`);
      throw new NotFoundException(`User not found`);
    }
  }
}
