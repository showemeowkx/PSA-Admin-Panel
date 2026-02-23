import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity: number;
}
