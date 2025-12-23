import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AdminGuard } from 'src/admin.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './enteties/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<void> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(): Promise<{ data: Category[] }> {
    return this.categoriesService.findAll();
  }
}
