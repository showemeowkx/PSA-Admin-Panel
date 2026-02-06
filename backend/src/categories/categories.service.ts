/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './enteties/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<void> {
    const categoryEntity = this.categoryRepository.create({
      ...createCategoryDto,
      isActive: true,
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

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
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
      throw new InternalServerErrorException(
        `Failed to get categories: ${error.stack}`,
      );
    }
  }

  async findOneByUkrskladId(ukrskladId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { ukrskladId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with UkrSklad ID ${ukrskladId} not found`,
      );
    }

    return category;
  }

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

  async remove(ids: number | number[]): Promise<void> {
    const result = await this.categoryRepository.softDelete(ids);

    if (result.affected === 0) {
      const idMsg = Array.isArray(ids) ? ids.join(', ') : ids;
      throw new NotFoundException(`No categories found with IDs: ${idMsg}`);
    }
  }

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
