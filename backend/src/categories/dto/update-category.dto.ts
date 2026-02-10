import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  iconPath?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
