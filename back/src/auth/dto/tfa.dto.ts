import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class TFADto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
