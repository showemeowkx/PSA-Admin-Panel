import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, IsEnum } from 'class-validator';

export enum SortMethod {
  ASC = 'ASC',
  DESC = 'DESC',
  PROMO = 'PROMO',
}

export class GetProductsFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  storeId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(SortMethod)
  sortMethod?: SortMethod = SortMethod.PROMO;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  showAll?: 0 | 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  showInactive?: 0 | 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  showDeleted?: 0 | 1;
}
