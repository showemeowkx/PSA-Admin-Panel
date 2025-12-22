/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductStock } from './entities/product-stock.entity';
import { Category } from 'src/categories/enteties/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductStock)
    private stockRepository: Repository<ProductStock>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<void> {
    const category = await this.findOne(createProductDto.categoryId);

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    if (!createProductDto.stocks || createProductDto.stocks.length === 0) {
      throw new ConflictException("Incorrect 'stoks' value");
    }

    const productEntity = this.productRepository.create({
      ...createProductDto,
      category,
      imagePath: '', // Placeholder
      isPromo: createProductDto.pricePromo === null,
      updatedAt: new Date(),
    });

    try {
      const product = await this.productRepository.save(productEntity);

      if (createProductDto.stocks && createProductDto.stocks.length > 0) {
        const stocks = createProductDto.stocks.map((s) =>
          this.stockRepository.create({
            product,
            storeId: s.storeId,
            quantity: s.quantity,
          }),
        );

        await this.stockRepository.save(stocks);
      }
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This product already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create a product: ${error.stack}`,
      );
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['stocks', 'stocks.store', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
