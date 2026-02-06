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
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { GetProductsFiltersDto } from './dto/get-products-filters.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('products')
export class ProductsController {
  private logger = new Logger(ProductsController.name);

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
    this.logger.verbose(
      `Creating a product... {ukrskladId: ${createProductDto.ukrskladId}}`,
    );

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
    this.logger.verbose(
      `Getting products... {page: ${getProductsFiltersDto.page}, limit: ${getProductsFiltersDto.limit}}`,
    );
    return this.productsService.findAll(getProductsFiltersDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    this.logger.verbose(`Getting a product by ID... {productId: ${id}}`);
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
    this.logger.verbose(`Updating a product... {productId: ${id}}`);

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
    this.logger.verbose(`Deleting a product... {productId: ${id}}`);

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
