import { IsOptional, IsString } from 'class-validator';

export class GetStoresFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;
}
