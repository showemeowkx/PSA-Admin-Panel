import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartModule } from 'src/cart/cart.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsModule } from 'src/products/products.module';
import { ConfigModule } from '@nestjs/config';
import { ProductStock } from 'src/products/entities/product-stock.entity';
import { SyncModule } from 'src/sync/sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, ProductStock]),
    CartModule,
    ProductsModule,
    ConfigModule,
    SyncModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
