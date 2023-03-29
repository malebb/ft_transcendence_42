import { IsString, IsOptional, Matches } from 'class-validator';

export class EditUserDto {
  @Matches(/^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/)
  @IsString()
  @IsOptional()
  login?: string;
}
