import {
  IsEmail,
  isNotEmpty,
  IsNotEmpty,
  isString,
  IsString,
  Matches,
} from 'class-validator';

export class AuthDto {
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*^()-_=]).{8,24}$/)
  @IsString()
  @IsNotEmpty()
  password: string;
}
