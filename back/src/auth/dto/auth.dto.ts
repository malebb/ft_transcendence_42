import { IsEmail, isNotEmpty, IsNotEmpty, isString, IsString } from 'class-validator';

export class AuthDto{
    
<<<<<<< HEAD
=======
//    @IsEmail()
>>>>>>> socket
    @IsNotEmpty()
    email: string;


    @IsString()
    @IsNotEmpty()
    password: string;
}
