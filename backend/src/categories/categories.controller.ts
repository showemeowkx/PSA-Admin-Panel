import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AdminGuard } from 'src/admin.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './enteties/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    if (file) {
      const result = await this.cloudinaryService.uploadFile(file);
      createCategoryDto.iconPath = result.secure_url as string;
    } else {
      createCategoryDto.iconPath = this.configService.get(
        'DEFAULT_CATEGORY_ICON',
      );
    }
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

  @Delete()
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
