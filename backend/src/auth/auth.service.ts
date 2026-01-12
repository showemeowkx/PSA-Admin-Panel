/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
import { CartService } from 'src/cart/cart.service';
import { StoreService } from 'src/store/store.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly cartService: CartService,
    private readonly storeService: StoreService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    const { password, phone } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      password: hashedPassword,
      phone: phone.trim().replaceAll(' ', ''),
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

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
