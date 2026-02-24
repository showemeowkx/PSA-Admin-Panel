/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
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
  private logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsServive: ProductsService,
  ) {}

  async getCartByUserId(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.product.stocks'],
      order: { items: { id: 'ASC' } },
    });

    if (!cart) {
      this.logger.error(`Cart not found for user with ID ${userId}`);
      throw new NotFoundException('Кошик не знайдено для цього користувача.');
    }

    return cart;
  }

  async create(user: User): Promise<void> {
    const cartEntity = { user, items: [] };
    try {
      await this.cartRepository.save(cartEntity);
    } catch (error) {
      this.logger.error(`Failed to create a cart: ${error.stack}`);
      throw new InternalServerErrorException(
        'Не вдалося створити кошик. Спробуйте ще раз пізніше.',
      );
    }
  }

  async addToCart(user: User, addToCartDto: AddToCartDto): Promise<void> {
    const cart = await this.getCartByUserId(user.id);
    const { productId, quantity, setQuantity } = addToCartDto;

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
          const comparedQuantity = setQuantity
            ? quantity
            : existingItem.quantity + quantity;

          if (stock.available < comparedQuantity) {
            this.logger.error(
              `Not enough products available {productId: ${product.id}, stockId: ${stock.id}}`,
            );
            throw new BadRequestException('Недостатньо товарів у наявності.');
          }
        }

        if (stock.available < quantity) {
          this.logger.error(
            `Not enough products available {productId: ${product.id}, stockId: ${stock.id}}`,
          );
          throw new BadRequestException('Недостатньо товарів у наявності.');
        }
      } else {
        this.logger.error(
          `Product not found in store {productId: ${product.id}, storeId: ${chosenStoreId}}`,
        );
        throw new BadRequestException('Товар не знайдено в обраному магазині.');
      }
    }

    try {
      if (existingItem) {
        if (setQuantity) {
          existingItem.quantity = quantity;
        } else {
          existingItem.quantity += quantity;
        }
        await this.cartItemRepository.save(existingItem);

        if (existingItem.quantity === 0) {
          await this.cartItemRepository.remove(existingItem);
        }
      } else {
        const newItem = this.cartItemRepository.create({
          cart,
          product,
          quantity,
        });

        await this.cartItemRepository.save(newItem);
      }
    } catch (error) {
      this.logger.error(`Failed to add a product to a cart: ${error.stack}`);
      throw new InternalServerErrorException(
        'Не вдалося додати товар до кошика. Спробуйте ще раз пізніше.',
      );
    }
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCartByUserId(userId);
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
      this.logger.error(
        `Item not found in cart {userId: ${userId}, productId: ${productId}}`,
      );
      throw new NotFoundException('Товар не знайдено в кошику.');
    }
  }
}
