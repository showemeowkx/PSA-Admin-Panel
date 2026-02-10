/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CronJob, CronTime } from 'cron';
import { UkrSkladService } from './ukrsklad.service';
import { In, Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStock } from 'src/products/entities/product-stock.entity';
import { ConfigService } from '@nestjs/config';
import { StoreService } from 'src/store/store.service';
import { CategoriesService } from 'src/categories/categories.service';
import { ProductsService } from 'src/products/products.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AutoClearCache } from 'src/common/decorators/auto-clear-cache.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class SyncService {
  private logger = new Logger(SyncService.name);
  private readonly JOB_NAME = 'auto_sync_job';

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly ukrSklad: UkrSkladService,
    private readonly configService: ConfigService,
    private readonly storeService: StoreService,
    private readonly categoriesService: CategoriesService,
    private readonly productService: ProductsService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductStock)
    private stockRepository: Repository<ProductStock>,
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
  ) {}

  onModuleInit() {
    const defaultCron = '0 0 * * * *';
    this.addCronJob(defaultCron);
  }

  addCronJob(cronExpression: string): void {
    if (this.schedulerRegistry.doesExist('cron', this.JOB_NAME)) {
      this.schedulerRegistry.deleteCronJob(this.JOB_NAME);
    }

    const job = new CronJob(cronExpression, async () => {
      await this.syncAll('auto');
    });

    this.schedulerRegistry.addCronJob(this.JOB_NAME, job);
    job.start();
  }

  async setSyncState(enabled: boolean): Promise<void> {
    if (this.schedulerRegistry.doesExist('cron', this.JOB_NAME)) {
      const job = this.schedulerRegistry.getCronJob(this.JOB_NAME);
      if (enabled) {
        job.start();
      } else {
        await job.stop();
      }
    }
  }

  getSyncStatus(): {
    running: boolean;
    nextRun: Date | null;
    lastRun: Date | null;
    period: CronTime | null;
  } {
    if (!this.schedulerRegistry.doesExist('cron', this.JOB_NAME)) {
      return { running: false, nextRun: null, lastRun: null, period: null };
    }

    const job = this.schedulerRegistry.getCronJob(this.JOB_NAME);
    return {
      running: job.isActive,
      nextRun: job.nextDate().toJSDate(),
      lastRun: job.lastDate(),
      period: job.cronTime,
    };
  }

  async syncAll(source: string = 'manual'): Promise<{
    status: string;
    synced: string[];
    errors: string[];
  }> {
    this.logger.verbose(`Beginning sync process... {source: ${source}}`);
    await this.setSyncState(false);

    const synced: string[] = [];
    const errors: string[] = [];
    let status = 'success';

    try {
      const [storesRes, categoriesRes, productsRes] = await Promise.all([
        this.syncStores(),
        this.syncCategories(),
        this.syncProducts(),
      ]);

      if (storesRes.status === 'success') {
        synced.push('Stores');
      } else {
        this.logger.warn('Stores sync failed! Check report for error details.');
        errors.push(...storesRes.errors);
      }

      if (categoriesRes.status === 'success') {
        synced.push('Categories');
      } else {
        this.logger.warn(
          'Categories sync failed! Check report for error details.',
        );
        errors.push(...categoriesRes.errors);
      }

      if (productsRes.status === 'success') {
        synced.push('Products');
      } else {
        this.logger.warn(
          'Products sync failed! Check report for error details.',
        );
        errors.push(...productsRes.errors);
      }

      if (synced.length === 0) {
        status = 'failed';
      } else if (synced.length < 3) {
        status = 'partial';
      }
    } catch (error) {
      status = 'failed';
      this.logger.error(`Critical Sync execution error: ${error.message}`);
      errors.push(`Critical Sync execution error: ${error.message}`);
    } finally {
      await this.setSyncState(true);
    }

    this.logger.verbose(`SYNC REPORT [source: ${source}]:`);
    this.logger.verbose(`Status: ${status}`);
    this.logger.verbose(`Synced: ${synced.join(', ') || 'none'}`);
    this.logger.verbose(`Errors: ${errors.join(', ') || 'none'}`);

    return { status, synced, errors };
  }

  async syncStores(): Promise<{ status: string; errors: string[] }> {
    this.logger.verbose('Beginning stores sync process...');

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
        this.logger.error(`Failed to sync stores: ${error.stack}`);
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
      this.logger.error(`Failed to sync stores: ${error.stack}`);
      errors.push(error.stack as string);
    }

    this.logger.verbose('Stores synced successfully!');
    return { status, errors };
  }

  async syncCategories(): Promise<{ status: string; errors: string[] }> {
    this.logger.verbose('Beginning categories sync process...');

    let status = 'success';
    const errors: string[] = [];

    const ukrSkladCategories = await this.ukrSklad.getCategories();
    const existingCategoriesResponse = await this.categoriesService.findAll({
      limit: 0,
      showDeleted: 1,
      showInactive: 1,
    });
    const existingCategories = existingCategoriesResponse.data;

    const categoryMap = new Map(
      existingCategories.map((s) => [s.ukrskladId, s]),
    );

    for (const c of ukrSkladCategories) {
      const category = categoryMap.get(c.NUM);
      const incomingName = c.NAME || `Category #${c.NUM}`;

      const categoryData = {
        ukrskladId: c.NUM,
        name: c.NAME,
        lastSyncedName: incomingName,
      };

      try {
        if (category) {
          categoryMap.delete(c.NUM);

          await this.categoriesService.restore(category.id);
          if (category.lastSyncedName === c.NAME) {
            categoryData.name = category.name;
          }

          await this.categoriesService.update(category.id, {
            ...categoryData,
            isActive: category.isActive,
          });
        } else {
          await this.categoriesService.create({
            ...categoryData,
            iconPath: this.configService.get<string>('DEFAULT_CATEGORY_ICON'),
          });
        }
      } catch (error) {
        status = 'failed';
        this.logger.error(`Failed to sync categories: ${error.stack}`);
        errors.push(error.stack as string);
      }

      if (status !== 'success') {
        return { status, errors };
      }
    }

    try {
      const categoriesToDelete = Array.from(categoryMap.values());
      if (categoriesToDelete.length > 0) {
        const idsToDelete = categoriesToDelete.map((c) => c.id);
        await this.categoriesService.remove(idsToDelete);
      }
    } catch (error) {
      status = 'failed';
      this.logger.error(`Failed to sync categories: ${error.stack}`);
      errors.push(error.stack as string);
    }

    this.logger.verbose('Categories synced successfully!');
    return { status, errors };
  }

  @AutoClearCache('/products')
  async syncProducts(
    ids?: number[],
  ): Promise<{ status: string; errors: string[] }> {
    this.logger.verbose('Beginning products sync process...');

    let status = 'success';
    const errors: string[] = [];

    const [products, stocks] = await Promise.all([
      this.ukrSklad.getProducts(ids),
      this.ukrSklad.getProductStock(ids),
    ]);

    const findOptions: { withDeleted: boolean; where?: { ukrskladId: any } } = {
      withDeleted: true,
    };
    if (ids && ids.length > 0) {
      findOptions.where = { ukrskladId: In(ids) };
    }

    const [allStoresResponse, allCategoriesResponse, existingProducts] =
      await Promise.all([
        this.storeService.findAll({}),
        this.categoriesService.findAll({
          limit: 0,
          showDeleted: 1,
          showInactive: 1,
        }),
        this.productRepository.find(findOptions),
      ]);

    const allStores = allStoresResponse.data;
    const allCategories = allCategoriesResponse.data;

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
          lastSyncedName: p.NAME,
          description: product ? product.description : undefined,
          price: p.PRICE,
          pricePromo: p.PRICE_PROMO,
          isPromo: Boolean(p.PRICE_PROMO),
          isActive: true,
          unitsOfMeasurments: p.UNIT,
          imagePath: defaultImage,
          updatedAt: new Date(),
          category: p.CATEGORY_ID ? categoryMap.get(p.CATEGORY_ID) : undefined,
        };

        try {
          if (product) {
            productMap.delete(p.NUM);

            if (product?.deletedAt) {
              await this.productService.restore(product.id);
            }

            productData.isActive = product.isActive;
            productData.imagePath = product.imagePath;

            if (product.lastSyncedName === p.NAME) {
              productData.name = product.name;
            }
          }

          productEntitiesToSave.push(productData);
        } catch (error) {
          status = 'failed';
          this.logger.error(`Failed to sync products: ${error.stack}`);
          errors.push(error.stack as string);
        }
      }

      if (status !== 'success') {
        return { status, errors };
      }

      const savedBatch = await this.productRepository.save(
        productEntitiesToSave,
      );

      for (const savedProduct of savedBatch) {
        const productStockData = stocks.filter(
          (s) => s.PRODUCT_ID === savedProduct.ukrskladId,
        );

        for (const sData of productStockData) {
          try {
            const store = storeMap.get(sData.STORE_ID);
            if (store) {
              stockEntitiesToSave.push({
                product: savedProduct,
                storeId: store.id,
                quantity: sData.QUANTITY,
              });
            }
          } catch (error) {
            status = 'failed';
            this.logger.error(`Failed to sync stocks: ${error.stack}`);
            errors.push(error.stack as string);
          }
        }
      }

      if (status !== 'success') {
        return { status, errors };
      }

      try {
        if (stockEntitiesToSave.length > 0) {
          await this.stockRepository.upsert(stockEntitiesToSave, {
            conflictPaths: ['product', 'storeId'],
            skipUpdateIfNoValuesChanged: true,
          });
        }
      } catch (error) {
        status = 'failed';
        this.logger.error(`Failed to sync stocks: ${error.stack}`);
        errors.push(error.stack as string);
      }
    }

    if (status !== 'success') {
      return { status, errors };
    }

    try {
      const productsToDelete = Array.from(productMap.values());
      if (productsToDelete.length > 0) {
        const idsToDelete = productsToDelete.map((p) => p.id);
        await this.productService.remove(idsToDelete);
      }
    } catch (error) {
      status = 'failed';
      this.logger.error(`Failed to sync products: ${error.stack}`);
      errors.push(error.stack as string);
    }

    this.logger.verbose('Products synced successfully!');
    return { status, errors };
  }
}
