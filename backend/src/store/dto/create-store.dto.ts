import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsInt()
  ukrskladId: number;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  address: string;
}
