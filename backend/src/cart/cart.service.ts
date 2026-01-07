/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async getCartByUserId(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found for this user');
    }

    return cart;
  }

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

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<void> {
    const cart = await this.getCartByUserId(userId);
    const { productId, quantity } = addToCartDto;

    const existingItem = cart.items.find(
      (item) => item.product.id === productId,
    );
    try {
      if (existingItem) {
        existingItem.quantity += quantity;
        await this.cartItemRepository.save(existingItem);
      } else {
        const productRef = new Product();
        productRef.id = productId;

        const newItem = this.cartItemRepository.create({
          cart: cart,
          product: productRef,
          quantity: quantity,
        });
        await this.cartItemRepository.save(newItem);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to add a product to a cart: ${error.stack}`,
      );
    }
  }
}
