/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';

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

  findAll() {
    return `This action returns all store`;
  }

  findOne(id: number) {
    return `This action returns a #${id} store`;
  }

  update(id: number, updateStoreDto: UpdateStoreDto) {
    return `This action updates a #${id} store`;
  }

  remove(id: number) {
    return `This action removes a #${id} store`;
  }
}
