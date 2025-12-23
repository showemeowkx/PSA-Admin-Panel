import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsInt()
  ukrskladId: number;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name: string;
}
