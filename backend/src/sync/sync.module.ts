import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/enteties/category.entity';
import { ProductsModule } from 'src/products/products.module';
import { Store } from 'src/store/entities/store.entity';
import { ConfigModule } from '@nestjs/config';
import { UkrSkladService } from './ukrsklad.service';
import { ProductStock } from 'src/products/entities/product-stock.entity';
import { StoreModule } from 'src/store/store.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Store, ProductStock]),
    ProductsModule,
    ConfigModule,
    StoreModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [SyncController],
  providers: [SyncService, UkrSkladService],
})
export class SyncModule {}
