import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class StockDto {
  @IsNumber()
  storeId: number;

  @IsNumber()
  quantity: number;
}

export class CreateProductDto {
  @IsInt()
  ukrskladId: number;

  @IsString()
  @MinLength(10)
  @MaxLength(300)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsInt()
  @Type(() => Number)
  categoryId: number;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsString()
  @IsOptional()
  imagePath?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pricePromo?: number;

  @IsString()
  unitsOfMeasurments: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockDto)
  stocks: StockDto[];
}
