import { Injectable } from '@nestjs/common';
import { UkrSkladService } from './ukrsklad.service';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/enteties/category.entity';
import { Store } from 'src/store/entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStock } from 'src/products/entities/product-stock.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SyncService {
  constructor(
    private readonly ukrSklad: UkrSkladService,
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(ProductStock)
    private stockRepository: Repository<ProductStock>,
  ) {}

  async syncAll(): Promise<{ status: string }> {
    await this.syncStores();
    await this.syncCategories();
    await this.syncProducts();

    return { status: 'success' };
  }

  async syncStores() {
    const stores = await this.ukrSklad.getStores();

    for (const s of stores) {
      let store = await this.storeRepository.findOne({
        where: { ukrskladId: s.NUM },
      });

      if (!store) {
        store = this.storeRepository.create({ ukrskladId: s.NUM });
      }

      store.address = s.ADDRESS || `Store #${s.NUM}`;
      store.isActive = true;
      await this.storeRepository.save(store);
    }
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
