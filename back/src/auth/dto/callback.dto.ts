
import { IsEmail, isNotEmpty, IsNotEmpty, isString, IsString } from 'class-validator';

export class CallbackDto{
    
    @IsNotEmpty()
    code: string;
}