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
  @MaxLength(2000)
  description: string;

  @IsInt()
  categoryId: number;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  pricePromo?: number;

  @IsNumber()
  portionSize: number;

  @IsString()
  unitsOfMeasurments: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockDto)
  stocks: StockDto[];
}
