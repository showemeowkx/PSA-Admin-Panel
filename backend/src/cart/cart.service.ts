/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
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
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsServive: ProductsService,
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

  async addToCart(user: User, addToCartDto: AddToCartDto): Promise<void> {
    const cart = await this.getCartByUserId(user.id);
    const { productId, quantity } = addToCartDto;

    const existingItem = cart.items.find(
      (item) => item.product.id === productId,
    );

    const product = await this.productsServive.findOne(productId);

    if (product) {
      const chosenStoreId = user.selectedStoreId;
      const stock = product.stocks.find(
        (stock) => stock.storeId === chosenStoreId,
      );

      if (stock) {
        if (existingItem) {
          if (stock.quantity < existingItem.quantity + quantity) {
            throw new BadRequestException('No enough products in stock');
          }
        }

        if (stock.quantity < quantity) {
          throw new BadRequestException('No enough products in stock');
        }
      } else {
        throw new BadRequestException(
          `Unnable to find product [${product.id}] in store [${chosenStoreId}]`,
        );
      }
    }

    try {
      if (existingItem) {
        existingItem.quantity += quantity;
        await this.cartItemRepository.save(existingItem);
      } else {
        const newItem = this.cartItemRepository.create({
          cart,
          product,
          quantity,
        });

        await this.cartItemRepository.save(newItem);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to add a product to a cart: ${error.stack}`,
      );
    }
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCartByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    await this.cartItemRepository.delete({ cart: { id: cart.id } });
  }

  async removeFromCart(
    userId: number,
    productId: number,
    removeAll: 0 | 1,
  ): Promise<void> {
    const cart = await this.getCartByUserId(userId);

    const itemToRemove = cart.items.find(
      (item) => item.product.id === productId,
    );

    if (itemToRemove) {
      if (removeAll == 1 || itemToRemove.quantity <= 1) {
        await this.cartItemRepository.remove(itemToRemove);
      } else {
        itemToRemove.quantity -= 1;
        await this.cartItemRepository.save(itemToRemove);
      }
    } else {
      throw new NotFoundException('Item not found in cart');
    }
  }
}
