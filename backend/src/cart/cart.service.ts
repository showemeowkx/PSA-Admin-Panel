/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
  ) {}

  async create(user: User): Promise<void> {
    const cartEntity = { user, items: [] };
    try {
      await this.cartRepository.save(cartEntity);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create a cart: ${error.stack}`,
      );
    }
  }
}
