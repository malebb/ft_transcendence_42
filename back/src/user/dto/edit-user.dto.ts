import {IsEmail, IsString, IsOptional} from "class-validator";

export class EditUserDto {
    @IsEmail()
    @IsOptional()
    login?: string

}