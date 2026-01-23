/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dto/sing-in.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { StoreService } from 'src/store/store.service';
import { CartService } from 'src/cart/cart.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly cartService: CartService,
    private readonly storeService: StoreService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    const { password, phone } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      password: hashedPassword,
      phone: phone.trim().replaceAll(' ', ''),
      imagePath: this.configService.get('DEFAULT_USER_PFP') as string,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      await this.cartService.create(savedUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This user already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken }> {
    const { login, password } = signInDto;

    const user = await this.userRepository.findOneBy([
      { phone: login },
      { email: login },
    ]);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { login, isAdmin: user.isAdmin };
      const accessToken: string = await this.jwtService.signAsync(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Wrong login or password!');
    }
  }

  async chooseStore(user: User, storeId: number): Promise<void> {
    const store = await this.storeService.findOne(storeId);

    if (!store.isActive) {
      throw new Error(`Store with ID ${storeId} is not active`);
    }

    user.selectedStore = store;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to asign a store {userId: ${user.id}, storeId}: ${storeId}: ${error.stack}`,
      );
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { password } = updateUserDto;

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      updateUserDto.password = hashedPassword;
    }

    try {
      this.userRepository.merge(user, updateUserDto);
      return this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update a user: ${error.stack}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
