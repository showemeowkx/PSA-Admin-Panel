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

  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Category> {
    if (file) {
      const oldCategory = await this.categoriesService.findOne(id);
      const oldIconPath = oldCategory.iconPath;

      if (
        oldIconPath &&
        oldIconPath != this.configService.get('DEFAULT_CATEGORY_ICON')
      ) {
        await this.cloudinaryService.deleteFile(oldIconPath);
      }

      const result = await this.cloudinaryService.uploadFile(file);
      updateCategoryDto.iconPath = result.secure_url as string;
    }
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const category = await this.categoriesService.findOne(id);
    const iconPath = category.iconPath;

    await this.categoriesService.remove(id);

    if (
      category &&
      iconPath !== this.configService.get('DEFAULT_CATEGORY_ICON')
    ) {
      await this.cloudinaryService.deleteFile(iconPath);
    }
  }
}
