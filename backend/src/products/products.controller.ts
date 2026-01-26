import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminGuard } from 'src/admin.guard';
import { Product } from './entities/product.entity';
import { GetProductsFiltersDto } from './dto/get-products-filters.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    if (file) {
      const result = await this.cloudinaryService.uploadFile(file);
      createProductDto.imagePath = result.secure_url as string;
    } else {
      createProductDto.imagePath = this.configService.get(
        'DEFAULT_PRODUCT_IMAGE',
      );
    }
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() getProductsFiltersDto: GetProductsFiltersDto): Promise<{
    data: Product[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return this.productsService.findAll(getProductsFiltersDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Product> {
    let oldImagePath = '';
    if (file) {
      const product = await this.productsService.findOne(id);
      oldImagePath = product.imagePath;

      const result = await this.cloudinaryService.uploadFile(file);
      updateProductDto.imagePath = result.secure_url as string;
    }
    const updatedProduct = await this.productsService.update(
      id,
      updateProductDto,
    );

    if (
      oldImagePath &&
      oldImagePath !== this.configService.get('DEFAULT_PRODUCT_IMAGE')
    ) {
      await this.cloudinaryService.deleteFile(oldImagePath);
    }

    return updatedProduct;
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const product = await this.productsService.findOne(id);
    const imagePath = product.imagePath;

    await this.productsService.remove(id);

    if (
      imagePath &&
      imagePath !== this.configService.get('DEFAULT_PRODUCT_IMAGE')
    ) {
      await this.cloudinaryService.deleteFile(imagePath);
    }
  }
}
