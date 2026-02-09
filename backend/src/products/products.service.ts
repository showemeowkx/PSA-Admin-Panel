/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductStock } from './entities/product-stock.entity';
import { GetProductsFiltersDto } from './dto/get-products-filters.dto';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  private logger = new Logger();

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductStock)
    private stockRepository: Repository<ProductStock>,
    private categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<void> {
    const category = await this.categoriesService.findOne(
      createProductDto.categoryId,
    );

    if (!createProductDto.stocks || createProductDto.stocks.length === 0) {
      this.logger.error("Incorrect 'stocks' value: cannot be empty");
      throw new ConflictException("Incorrect 'stocks' value: cannot be empty");
    }

    const storeIds = createProductDto.stocks.map((s) => s.storeId);
    const uniqueStoreIds = new Set(storeIds);
    if (storeIds.length !== uniqueStoreIds.size) {
      this.logger.error('Duplicate store IDs found in payload');
      throw new ConflictException('Duplicate store IDs found in payload');
    }

    const { stocks: stocksDto, ...productData } = createProductDto;

    let savedProduct: Product;
    try {
      const productEntity = this.productRepository.create({
        ...productData,
        category,
        isPromo: Boolean(createProductDto.pricePromo),
        updatedAt: new Date(),
      });
      savedProduct = await this.productRepository.save(productEntity);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(
          `Product with UkrSklad ID ${createProductDto.ukrskladId} already exists`,
        );
        throw new ConflictException(
          'Product with this UkrSklad ID already exists',
        );
      }
      this.logger.error(`Failed to create a product: ${error.stack}`);
      throw new InternalServerErrorException('Failed to create a product');
    }

    try {
      this.logger.verbose(`Creating stocks... {productId: ${savedProduct.id}}`);

      const stocksEntities = stocksDto.map((s) =>
        this.stockRepository.create({
          product: savedProduct,
          storeId: s.storeId,
          quantity: s.quantity,
          reserved: 0,
        }),
      );

      await this.stockRepository.save(stocksEntities);
    } catch (error) {
      await this.productRepository.delete(savedProduct.id);

      if (error.code === '23505') {
        this.logger.error(
          `Database Error: Duplicate stock entry detected. Detail: ${error.detail}`,
        );
        throw new ConflictException(
          'Database Error: Duplicate stock entry detected',
        );
      }
      this.logger.error(
        `Failed to save stocks. Rolled back. Error: ${error.message}`,
      );

      throw new InternalServerErrorException(
        'Failed to save stocks. Rolled back',
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

    const showAll = Boolean(getProductsFiltersDto.showAll);
    const qb = this.productRepository.createQueryBuilder('product');

    qb.leftJoinAndSelect('product.category', 'category');
    qb.leftJoinAndSelect('product.stocks', 'stock');
    qb.leftJoinAndSelect('stock.store', 'store');

    qb.addSelect(
      'CASE WHEN product.isPromo = true THEN product.pricePromo ELSE product.price END',
      'effective_price',
    );

    if (!showAll) {
      qb.andWhere('stock.quantity > 0');
      qb.withDeleted();
    }

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
      qb.andWhere(
        'CASE WHEN product.isPromo = true THEN product.pricePromo ELSE product.price END >= :minPrice',
        { minPrice },
      );
    }
    if (maxPrice !== undefined) {
      qb.andWhere(
        'CASE WHEN product.isPromo = true THEN product.pricePromo ELSE product.price END <= :maxPrice',
        { maxPrice },
      );
    }

    if (sortMethod != 'PROMO') {
      qb.orderBy('effective_price', sortMethod);
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
      withDeleted: true,
      relations: ['stocks', 'stocks.store', 'category'],
    });

    if (!product) {
      this.logger.error(`Product with ID ${id} not found`);
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    isOrderChange: boolean = false,
  ): Promise<Product> {
    const { stocks, categoryId, ...productDetails } = updateProductDto;

    const product = await this.findOne(id);

    if (categoryId) {
      const category = await this.categoriesService.findOne(categoryId);

      product.category = category;
      product.categoryId = categoryId;
    }

    this.productRepository.merge(product, productDetails);

    if ('pricePromo' in updateProductDto) {
      product.isPromo = Boolean(product.pricePromo);
    }

    if (!isOrderChange) {
      product.updatedAt = new Date();
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

  async remove(ids: number | number[]): Promise<void> {
    const result = await this.productRepository.softDelete(ids);

    if (result.affected === 0) {
      const idMsg = Array.isArray(ids) ? ids.join(', ') : ids;
      this.logger.error(`No products found with IDs: ${idMsg}`);
      throw new NotFoundException('Some products not found');
    }
  }

  async restore(id: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (product && product.deletedAt) {
      await this.productRepository.restore(product.id);
    }
  }
}
