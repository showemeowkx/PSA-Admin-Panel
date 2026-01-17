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
import { GetProductsFiltersDto } from './dto/get-products-filters.dto';

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
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    if (!createProductDto.stocks || createProductDto.stocks.length === 0) {
      throw new ConflictException("Incorrect 'stocks' value: cannot be empty");
    }

    const storeIds = createProductDto.stocks.map((s) => s.storeId);
    const uniqueStoreIds = new Set(storeIds);
    if (storeIds.length !== uniqueStoreIds.size) {
      throw new ConflictException(`Duplicate Store IDs found in payload.`);
    }

    const { stocks: stocksDto, ...productData } = createProductDto;

    let savedProduct: Product;
    try {
      const productEntity = this.productRepository.create({
        ...productData,
        category,
        imagePath: '',
        isPromo: Boolean(createProductDto.pricePromo),
        updatedAt: new Date(),
      });
      savedProduct = await this.productRepository.save(productEntity);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Product with this UkrSklad ID (${createProductDto.ukrskladId}) already exists`,
        );
      }
      throw error;
    }

    try {
      const stocksEntities = stocksDto.map((s) =>
        this.stockRepository.create({
          product: savedProduct,
          storeId: s.storeId,
          quantity: s.quantity,
        }),
      );

      await this.stockRepository.save(stocksEntities);
    } catch (error) {
      await this.productRepository.delete(savedProduct.id);
      console.error('Stock Save Error:', error);

      if (error.code === '23505') {
        throw new ConflictException(
          `Database Error: Duplicate stock entry detected. Detail: ${error.detail}`,
        );
      }
      throw new InternalServerErrorException(
        `Failed to save stocks. Rolled back. Error: ${error.message}`,
      );
    }
  }

  async findAll(getProductsFiltersDto: GetProductsFiltersDto): Promise<{
    data: Product[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      storeId,
      ukrskladId,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortMethod = 'PROMO',
    } = getProductsFiltersDto;

    const qb = this.productRepository.createQueryBuilder('product');

    qb.leftJoinAndSelect('product.category', 'category');
    qb.leftJoinAndSelect('product.stocks', 'stock');
    qb.leftJoinAndSelect('stock.store', 'store');

    if (storeId) {
      qb.andWhere('stock.storeId = :storeId', { storeId });
    }
    if (ukrskladId) {
      qb.andWhere('product.ukrskladId = :ukrskladId', { ukrskladId });
    }
    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (sortMethod != 'PROMO') {
      qb.orderBy('product.price', sortMethod);
    } else {
      qb.orderBy('product.isPromo', 'DESC');
      qb.addOrderBy('product.updatedAt', 'DESC');
    }

    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { stocks, categoryId, ...productDetails } = updateProductDto;

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['stocks'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      product.category = category;
      product.categoryId = categoryId;
    }

    this.productRepository.merge(product, productDetails);

    if ('pricePromo' in updateProductDto) {
      product.isPromo = Boolean(product.pricePromo);
    }

    if (stocks && stocks.length > 0) {
      for (const stockDto of stocks) {
        const existingStock = product.stocks.find(
          (s) => s.storeId === stockDto.storeId,
        );

        if (existingStock) {
          existingStock.quantity = stockDto.quantity;
        } else {
          const newStock = this.stockRepository.create({
            storeId: stockDto.storeId,
            quantity: stockDto.quantity,
            product: product,
          });
          product.stocks.push(newStock);
        }
      }
    }

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
