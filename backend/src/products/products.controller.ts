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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminGuard } from 'src/admin.guard';
import { Product } from './entities/product.entity';
import { GetProductsFiltersDto } from './dto/get-products-filters.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createProductDto: CreateProductDto): Promise<void> {
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
