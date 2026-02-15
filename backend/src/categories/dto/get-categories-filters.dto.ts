import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetCategoriesFiltersDto {
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
  showInactive?: 0 | 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  showDeleted?: 0 | 1;
}
