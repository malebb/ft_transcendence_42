import {
  IsEmail,
  isNotEmpty,
  IsNotEmpty,
  isString,
  IsString,
} from 'class-validator';

<<<<<<< HEAD
export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
=======
export class AuthDto{
    
//    @IsEmail()
    @IsNotEmpty()
    email: string;
>>>>>>> master

  @IsString()
  @IsNotEmpty()
  password: string;
}
