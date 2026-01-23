import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsInt()
  @Type(() => Number)
  ukrskladId: number;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name: string;

  @IsOptional()
  @IsString()
  iconPath?: string;
}
