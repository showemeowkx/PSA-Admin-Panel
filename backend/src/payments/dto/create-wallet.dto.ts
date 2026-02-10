import { IsCreditCard, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  cardHolder: string;

  @IsCreditCard()
  cardNumber: string;

  @IsString()
  @Length(2, 2)
  expireMonth: string;

  @IsString()
  @Length(2, 2)
  expireYear: string;

  @IsString()
  @Length(3, 3)
  cvv: string;
}
