import { IsString, IsNotEmpty } from "class-validator";

export class TFADto{
    
    @IsString()
    @IsNotEmpty()
    code: string;
}