import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  bankToken: string;

  @IsString()
  @IsNotEmpty()
  maskedCard: string;

  @IsOptional()
  @IsString()
  cardHolderFirstName?: string;

  @IsOptional()
  @IsString()
  cardHolderLastName?: string;
}
