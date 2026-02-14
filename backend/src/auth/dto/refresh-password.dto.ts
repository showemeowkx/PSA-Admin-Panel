import {
  MinLength,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  Length,
} from 'class-validator';

export class RefreshPasswordDto {
  @IsString()
  @IsPhoneNumber('UA')
  @IsNotEmpty()
  phoneRaw: string;

  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  code: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*\d)/, { message: 'The password is too weak!' })
  newPassword: string;
}
