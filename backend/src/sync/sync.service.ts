/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { UkrSkladService } from './ukrsklad.service';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/enteties/category.entity';
import { Store } from 'src/store/entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStock } from 'src/products/entities/product-stock.entity';
import { ConfigService } from '@nestjs/config';
import { StoreService } from 'src/store/store.service';

@Injectable()
export class SyncService {
  constructor(
    private readonly ukrSklad: UkrSkladService,
    private readonly configService: ConfigService,
    private readonly storeService: StoreService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(ProductStock)
    private stockRepository: Repository<ProductStock>,
  ) {}

  async syncAll(): Promise<{
    status: string;
    synced: string[];
    errors: string[];
  }> {
    let status = 'success';
    const synced: string[] = [];
    const errors: string[] = [];

    try {
      synced.push('Stores');
      await this.syncStores();
    } catch (error) {
      errors.push(error.stack as string);
      synced.pop();
    }

    try {
      synced.push('Categories');
      await this.syncCategories();
    } catch (error) {
      errors.push(error.stack as string);
      synced.pop();
    }

    try {
      synced.push('Products');
      await this.syncProducts();
    } catch (error) {
      errors.push(error.stack as string);
      synced.pop();
    }

    if (synced.length === 0) {
      status = 'failed';
    } else if (synced.length < 3) {
      status = 'partial';
    }

    return { status, synced, errors };
  }

  async syncStores(): Promise<{ status: string; errors: string[] }> {
    let status = 'success';
    const errors: string[] = [];

    const ukrSkladStores = await this.ukrSklad.getStores();
    const existingStoresResponse = await this.storeService.findAll({});
    const existingStores = existingStoresResponse.data;

    const storeMap = new Map(existingStores.map((s) => [s.ukrskladId, s]));

    for (const s of ukrSkladStores) {
      const store = storeMap.get(s.NUM);
      const incomingAddress = s.ADDRESS || `Store #${s.NUM}`;

      const storeData = {
        ukrskladId: s.NUM,
        address: incomingAddress,
        lastSyncedAddress: incomingAddress,
      };
      try {
        if (store) {
          storeMap.delete(s.NUM);

          await this.storeService.restore(store.id);
          if (store.lastSyncedAddress === s.ADDRESS) {
            storeData.address = store.address;
          }

          await this.storeService.update(store.id, {
            ...storeData,
            isActive: store.isActive,
          });
        } else {
          await this.storeService.create(storeData);
        }
      } catch (error) {
        status = 'failed';
        errors.push(error.stack as string);
      }
    }

    if (status !== 'success') {
      return { status, errors };
    }

    try {
      const storesToDelete = Array.from(storeMap.values());
      if (storesToDelete.length > 0) {
        const idsToDelete = storesToDelete.map((s) => s.id);
        await this.storeService.remove(idsToDelete);
      }
    } catch (error) {
      status = 'failed';
      errors.push(error.stack as string);
    }

    return { status, errors };
  }

  async syncCategories() {
    const categories = await this.ukrSklad.getCategories();

    for (const c of categories) {
      let category = await this.categoryRepository.findOne({
        where: { ukrskladId: c.NUM },
      });

      if (!category) {
        category = this.categoryRepository.create({
          ukrskladId: c.NUM,
          iconPath: this.configService.get<string>('DEFAULT_CATEGORY_ICON'),
        });
      }

      category.name = c.NAME || `Category #${c.NUM}`;
      await this.categoryRepository.save(category);
    }
  }

  async syncProducts() {
    const [products, stocks] = await Promise.all([
      this.ukrSklad.getProducts(),
      this.ukrSklad.getProductStock(),
    ]);
    const [allStores, allCategories, existingProducts] = await Promise.all([
      this.storeRepository.find(),
      this.categoryRepository.find(),
      this.productRepository.find({ select: ['id', 'ukrskladId'] }),
    ]);

    const storeMap = new Map(allStores.map((s) => [s.ukrskladId, s]));
    const categoryMap = new Map(allCategories.map((c) => [c.ukrskladId, c]));
    const productMap = new Map(existingProducts.map((p) => [p.ukrskladId, p]));

    const BATCH_SIZE = 100;
    const defaultImage = this.configService.get<string>(
      'DEFAULT_PRODUCT_IMAGE',
    );

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const productEntitiesToSave: Partial<Product>[] = [];
      const stockEntitiesToSave: Partial<ProductStock>[] = [];

      for (const p of batch) {
        const product = productMap.get(p.NUM);

        const productData = {
          id: product ? product.id : undefined,
          ukrskladId: p.NUM,
          name: p.NAME,
          price: p.PRICE,
          pricePromo: p.PRICE_PROMO,
          isPromo: Boolean(p.PRICE_PROMO),
          unitsOfMeasurments: p.UNIT,
          imagePath: product ? undefined : defaultImage,
          category: p.CATEGORY_ID ? categoryMap.get(p.CATEGORY_ID) : undefined,
        };

        if (product) delete productData.imagePath;

        productEntitiesToSave.push(productData);
      }

      const savedBatch = await this.productRepository.save(
        productEntitiesToSave,
      );

      for (const savedProduct of savedBatch) {
        const productStockData = stocks.filter(
          (s) => s.PRODUCT_ID === savedProduct.ukrskladId,
        );

        for (const sData of productStockData) {
          const store = storeMap.get(sData.STORE_ID);
          if (store) {
            stockEntitiesToSave.push({
              product: savedProduct,
              storeId: store.id,
              quantity: sData.QUANTITY,
            });
          }
        }
      }

      if (stockEntitiesToSave.length > 0) {
        await this.stockRepository.upsert(stockEntitiesToSave, {
          conflictPaths: ['product', 'storeId'],
          skipUpdateIfNoValuesChanged: true,
        });
      }
    }
  }
}
