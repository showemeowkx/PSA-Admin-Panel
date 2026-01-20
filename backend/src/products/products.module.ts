import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductStock } from './entities/product-stock.entity';
import { Category } from 'src/categories/enteties/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductStock, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
