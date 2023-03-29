import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  Length,
} from 'class-validator';

export class TFADto {
  @IsNumberString()
  @Length(6)
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
