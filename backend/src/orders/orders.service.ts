/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/cart/cart.service';
import { ProductsService } from 'src/products/products.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from './order-status.enum';

@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly productService: ProductsService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async create(user: User): Promise<void> {
    const cart = await this.cartService.getCartByUserId(user.id);

    if (!cart.items || cart.items.length === 0) {
      this.logger.error(`Cart is empty {userId: ${user.id}}`);
      throw new BadRequestException('Cart is empty');
    }

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const cartItem of cart.items) {
      const itemPrice = cartItem.product.pricePromo || cartItem.product.price;
      totalAmount += cartItem.quantity * itemPrice;

      const minOrderAmout =
        this.configService.get<number>('MIN_ORDER_AMNT') || 500;

      if (totalAmount < minOrderAmout) {
        this.logger.error(`Minimum order sum is ${minOrderAmout} UAH`);
        throw new ConflictException(
          `Minimum order sum is ${minOrderAmout} UAH`,
        );
      }

      const orderItem = this.orderItemRepository.create({
        product: cartItem.product,
        productImagePath: cartItem.product.imagePath,
        productName: cartItem.product.name,
        productUnitsOfMeasurments: cartItem.product.unitsOfMeasurments,
        priceAtPurchase: itemPrice,
        quantity: cartItem.quantity,
      });

      orderItems.push(orderItem);
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const newOrder = qr.manager.create(Order, {
        user,
        totalAmount,
        status: OrderStatus.PENDING,
        items: orderItems,
        createdAt: new Date(),
      });

      const savedOrder = await qr.manager.save(newOrder);

      for (const item of orderItems) {
        const chosenStore = user.selectedStoreId;
        const product = await this.productService.findOne(item.product.id);
        const stock = product.stocks.find(
          (stock) => stock.storeId === chosenStore,
        );

        await this.productService.update(
          item.product.id,
          {
            stocks: [
              {
                storeId: chosenStore,
                quantity: stock!.quantity - item.quantity,
              },
            ],
          },
          true,
        );
      }

      const date = savedOrder.createdAt;
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');

      savedOrder.orderNumber = `${yyyy}${mm}${dd}-${savedOrder.id}`;

      await qr.manager.save(savedOrder);

      await this.cartService.clearCart(user.id);

      await qr.commitTransaction();
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error(`Failed to create an order: ${error.stack}`);
      throw new InternalServerErrorException('Failed to create an order');
    } finally {
      await qr.release();
    }
  }

  async findAll(
    userId: number,
    paginationOptions: { page: number; limit: number },
  ): Promise<{
    data: Order[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 10 } = paginationOptions;

    const qb = this.orderRepository.createQueryBuilder('order');

    qb.andWhere('order.user.id = :userId', { userId });
    qb.skip((page - 1) * limit);
    qb.orderBy('order.createdAt', 'DESC');
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      this.logger.error(`Order with ID ${id} not found`);
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async remove(id: number): Promise<void> {
    const result = await this.orderRepository.delete(id);

    if (result.affected === 0) {
      this.logger.error(`Order with ID ${id} not found`);
      throw new NotFoundException('Order not found');
    }
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }
}
