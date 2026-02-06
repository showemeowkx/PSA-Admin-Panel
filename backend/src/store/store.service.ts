/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { GetStoresFiltersDto } from './dto/get-stores-filters.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<void> {
    const storeEntity = { ...createStoreDto, isActive: true };

    try {
      await this.storeRepository.save(storeEntity);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This store already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create a store: ${error.stack}`,
      );
    }
  }

  async findAll(
    getStoresFiltersDto: GetStoresFiltersDto,
  ): Promise<{ data: Store[]; metadata: { total: number } }> {
    const { search } = getStoresFiltersDto;

    const qb = this.storeRepository.createQueryBuilder('store');
    qb.withDeleted();

    if (search) {
      qb.andWhere('(store.address ILIKE :search)', { search: `%${search}%` });
    }

    const [stores, total] = await qb.getManyAndCount();

    return { data: stores, metadata: { total } };
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async findOneByUkrskladId(ukrskladId: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { ukrskladId },
    });

    if (!store) {
      throw new NotFoundException(
        `Store with UkrSklad ID ${ukrskladId} not found`,
      );
    }

    return store;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    this.storeRepository.merge(store, {
      ...updateStoreDto,
      updatedAt: new Date(),
    });

    return this.storeRepository.save(store);
  }

  async remove(ids: number | number[]): Promise<void> {
    if (Array.isArray(ids) && ids.length === 0) {
      return;
    }

    const result = await this.storeRepository.softDelete(ids);

    if (result.affected === 0) {
      const idMsg = Array.isArray(ids) ? ids.join(', ') : ids;
      throw new NotFoundException(`No stores found with IDs: ${idMsg}`);
    }
  }

  async restore(id: number): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (store && store.deletedAt) {
      await this.storeRepository.restore(store.id);
    }
  }
}
