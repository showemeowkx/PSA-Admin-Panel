import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AdminGuard } from 'src/admin.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './enteties/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  @Patch()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }
}
