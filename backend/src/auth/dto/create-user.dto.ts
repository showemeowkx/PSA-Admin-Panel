import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*\d)/, { message: 'The password is too weak!' })
  password: string;

  @IsString()
  @IsPhoneNumber('UA')
  @IsNotEmpty()
  phone: string;

  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  code: string;
}
