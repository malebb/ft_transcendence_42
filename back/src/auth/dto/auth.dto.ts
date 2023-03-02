import { IsEmail, isNotEmpty, IsNotEmpty, isString, IsString } from 'class-validator';

export class AuthDto{
    
//    @IsEmail()
    @IsNotEmpty()
    email: string;


    @IsString()
    @IsNotEmpty()
    password: string;
}
