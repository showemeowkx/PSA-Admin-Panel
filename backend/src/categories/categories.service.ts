/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './enteties/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AutoClearCache } from 'src/common/decorators/auto-clear-cache.decorator';
import type { Cache } from 'cache-manager';

@Injectable()
export class CategoriesService {
  private logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
  ) {}

  @AutoClearCache('/categories')
  async create(createCategoryDto: CreateCategoryDto): Promise<void> {
    const categoryEntity = this.categoryRepository.create({
      ...createCategoryDto,
      isActive: true,
    });

    try {
      await this.categoryRepository.save(categoryEntity);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(
          `Category already exists {name: ${createCategoryDto.name}}`,
        );
        throw new ConflictException('This category already exists');
      }
      this.logger.error(`Failed to create a category: ${error.stack}`);
      throw new InternalServerErrorException('Failed to create a category');
    }
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      this.logger.error(`Category with ID ${id} not found`);
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findAll(): Promise<{ data: Category[] }> {
    try {
      const categories = await this.categoryRepository.find({
        order: { id: 'ASC' },
        withDeleted: true,
      });

      return { data: categories };
    } catch (error) {
      this.logger.error(`Failed to get categories: ${error.stack}`);
      throw new InternalServerErrorException('Failed to get categories');
    }
  }

  @AutoClearCache('/categories')
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    this.categoryRepository.merge(category, {
      ...updateCategoryDto,
      updatedAt: new Date(),
    });

    return await this.categoryRepository.save(category);
  }

  @AutoClearCache('/categories')
  async remove(ids: number | number[]): Promise<void> {
    const result = await this.categoryRepository.softDelete(ids);

    if (result.affected === 0) {
      const idMsg = Array.isArray(ids) ? ids.join(', ') : ids;
      this.logger.error(`No categories found with IDs: ${idMsg}`);
      throw new NotFoundException('Some categories not found');
    }
  }

  @AutoClearCache('/categories')
  async restore(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (category && category.deletedAt) {
      await this.categoryRepository.restore(category.id);
    }
  }
}
