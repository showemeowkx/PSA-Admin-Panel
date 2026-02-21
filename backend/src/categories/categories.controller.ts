import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  // Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './enteties/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CacheTTL } from '@nestjs/cache-manager';
import { GetCategoriesFiltersDto } from './dto/get-categories-filters.dto';

@Controller('categories')
export class CategoriesController {
  private logger = new Logger(CategoriesController.name);
  private defaultCategoryIcons: string[];

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {
    this.defaultCategoryIcons = this.configService
      .get<string>('DEFAULT_CATEGORY_ICONS', '')
      .split(',')
      .filter(Boolean);
  }

  // @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    this.logger.verbose(
      `Creating a category... {ukrskladId: ${createCategoryDto.ukrskladId}}`,
    );

    if (file) {
      const result = await this.cloudinaryService.uploadFile(file);
      createCategoryDto.iconPath = result.secure_url as string;
    } else {
      this.logger.warn('No file uploaded. Using default...');
      createCategoryDto.iconPath = this.defaultCategoryIcons[0];
    }

    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @CacheTTL(60 * 60 * 1000)
  findAll(@Query() getCategoriesFiltersDto: GetCategoriesFiltersDto): Promise<{
    data: Category[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    this.logger.verbose('Getting all categories...');
    return this.categoriesService.findAll(getCategoriesFiltersDto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Category> {
    this.logger.verbose(`Updating a category... {categoryId: ${id}}`);

    let oldIconPath = '';
    if (file) {
      const oldCategory = await this.categoriesService.findOne(id);
      oldIconPath = oldCategory.iconPath;

      const result = await this.cloudinaryService.uploadFile(file);
      updateCategoryDto.iconPath = result.secure_url as string;
    }
    const updatedCategory = await this.categoriesService.update(
      id,
      updateCategoryDto,
    );

    if (oldIconPath && !this.defaultCategoryIcons.includes(oldIconPath)) {
      await this.cloudinaryService.deleteFile(oldIconPath);
    }

    return updatedCategory;
  }

  @Delete()
  @UseGuards(AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.verbose(`Deleting a category... {categoryId: ${id}}`);

    const category = await this.categoriesService.findOne(id);
    const iconPath = category.iconPath;

    await this.categoriesService.remove(id);

    if (category && !this.defaultCategoryIcons.includes(iconPath)) {
      await this.cloudinaryService.deleteFile(iconPath);
    }
  }
}
