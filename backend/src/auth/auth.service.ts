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

    const record = await this.verificationCodeRepository.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      this.logger.error(`No verification code found for number '${phone}'`);
      throw new BadRequestException(
        'No verification code found. Request a new one.',
      );
    }

    const minutesOld = (Date.now() - record.createdAt.getTime()) / 1000 / 60;
    const expiresIn =
      this.configService.get<number>('VERIFICATION_CODE_EXPIRE_MINUTES') || 5;

    if (minutesOld > expiresIn) {
      await this.verificationCodeRepository.delete({ phone });
      this.logger.error(`Code expired for number '${phone}'`);
      throw new BadRequestException('Code expired');
    }

    const isMatch = await bcrypt.compare(code, record.code);
    if (!isMatch) {
      this.logger.error(`Invalid verification code for number '${phone}'`);
      throw new BadRequestException('Invalid verification code');
    }

    this.logger.verbose(
      `Verification code accepted successfully for number '${phone}'`,
    );

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
      await this.verificationCodeRepository.delete({ phone });
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

    this.smsService.sendVerificationCode(phone, rawCode);
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken }> {
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
      const payload: JwtPayload = { login, isAdmin: user.isAdmin };
      const accessToken: string = await this.jwtService.signAsync(payload);
      return { accessToken };
    } else {
      this.logger.error(`Wrong login or password {login: ${login}}`);
      throw new UnauthorizedException('Wrong login or password!');
    }
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

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      updateUserDto.password = hashedPassword;
    }

    if (phoneRaw) {
      updateUserDto.phone = parsePhoneNumberWithError(
        phoneRaw,
        'UA',
      ).formatInternational();
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
