/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './enteties/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TopologyDescriptionChangedEvent } from 'typeorm/browser';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(TopologyDescriptionChangedEvent)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<void> {
    const categoryEntity = this.categoryRepository.create({
      ...createCategoryDto,
      iconPath: '', // PLACEHOLDER
    });

    try {
      await this.categoryRepository.save(categoryEntity);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This category already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create a category: ${error.stack}`,
      );
    }
  }
}
