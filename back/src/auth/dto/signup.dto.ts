import {
  IsEmail,
  isNotEmpty,
  IsNotEmpty,
  isString,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Matches(/^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/)
  @IsString()
  @IsNotEmpty()
  username: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*^()-_=]).{8,24}$/)
  @IsString()
  @IsNotEmpty()
  password: string;
}
