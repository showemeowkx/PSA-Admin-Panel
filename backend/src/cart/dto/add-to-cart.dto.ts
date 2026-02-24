import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsBoolean()
  @IsOptional()
  setQuantity?: boolean;
}
