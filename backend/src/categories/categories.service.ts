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
      });

      return { data: categories };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get categories: ${error.stack}`,
      );
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    this.categoryRepository.merge(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
