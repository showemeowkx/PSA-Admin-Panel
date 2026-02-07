import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class RequestVerificationCodeDto {
  @IsString()
  @IsPhoneNumber('UA')
  @IsNotEmpty()
  phone: string;
}
