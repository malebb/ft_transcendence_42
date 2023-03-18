import { IsString, IsOptional } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  login?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string
}
