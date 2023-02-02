import {IsEmail, IsString, IsOptional} from "class-validator";

export class EditUserDto {
    @IsEmail()
    @IsOptional()
    login?: string

    @IsString()
    @IsOptional()
    firstName?: string

    @IsString()
    @IsOptional()
    lastName?: string

    @IsString()
    @IsOptional()
    map?: string

    @IsString()
    @IsOptional()
    skin?: string
}
