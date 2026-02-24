/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { DataSource, Repository } from 'typeorm';
import { GetStoresFiltersDto } from './dto/get-stores-filters.dto';
import { AutoClearCache } from 'src/common/decorators/auto-clear-cache.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class StoreService {
  private logger = new Logger(StoreService.name);

  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
    private readonly dataSource: DataSource,
  ) {}

  @AutoClearCache('/store')
  async create(createStoreDto: CreateStoreDto): Promise<void> {
    const storeEntity = { ...createStoreDto, isActive: true };

    try {
      await this.storeRepository.save(storeEntity);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(
          `Store already exists {address: ${createStoreDto.address}}`,
        );
        throw new ConflictException('This store already exists');
      }
      this.logger.error(`Failed to create a store: ${error.stack}`);
      throw new InternalServerErrorException('Failed to create a store');
    }
  }

  async findAll(getStoresFiltersDto: GetStoresFiltersDto): Promise<{
    data: Store[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { limit = 10, page = 1, search } = getStoresFiltersDto;

    const showInactive = Boolean(getStoresFiltersDto.showInactive);
    const showDeleted = Boolean(getStoresFiltersDto.showDeleted);

    const qb = this.storeRepository.createQueryBuilder('store');

    if (!showInactive) {
      qb.andWhere('store.isActive = :isActive', { isActive: true });
    }
    if (showDeleted) {
      qb.withDeleted();
    }
    if (search) {
      qb.andWhere('(store.address ILIKE :search)', { search: `%${search}%` });
    }

    if (limit > 0) {
      qb.skip((page - 1) * limit);
      qb.take(limit);
    }

    qb.orderBy('store.id', 'ASC');

    const [stores, total] = await qb.getManyAndCount();

    return {
      data: stores,
      metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
    });

    if (!store) {
      this.logger.error(`Store with ID ${id} not found`);
      throw new NotFoundException('Магазин не знайдено.');
    }

    return store;
  }

  @AutoClearCache('/store')
  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    if (updateStoreDto.isActive === false && store.isActive) {
      await this._deactivate(store.id);
    }

    this.storeRepository.merge(store, {
      ...updateStoreDto,
      updatedAt: new Date(),
    });

    return this.storeRepository.save(store);
  }

  @AutoClearCache('/store')
  async remove(ids: number | number[]): Promise<void> {
    if (Array.isArray(ids) && ids.length === 0) {
      return;
    }

    const result = await this.storeRepository.softDelete(ids);

    if (result.affected === 0) {
      const idMsg = Array.isArray(ids) ? ids.join(', ') : ids;
      this.logger.error(`No stores found with IDs: ${idMsg}`);
      throw new NotFoundException('Деякі магазини не знайдено.');
    }
  }

  @AutoClearCache('/store')
  async restore(id: number): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (store && store.deletedAt) {
      await this.storeRepository.restore(store.id);
    }
  }

  private async _deactivate(storeId: number): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(User)
      .set({ selectedStoreId: null })
      .where('selectedStoreId = :id', { id: storeId })
      .andWhere('isAdmin = :isAdmin', { isAdmin: false })
      .execute();

    this.logger.log(`Deactivated store ${storeId} and reset users' selection`);
  }
}
