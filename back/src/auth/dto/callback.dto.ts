import {
  IsAlphanumeric,
  IsEmail,
  isNotEmpty,
  IsNotEmpty,
  isString,
  IsString,
  Length,
} from 'class-validator';

export class CallbackDto {
  @Length(64)
  @IsAlphanumeric()
  @IsNotEmpty()
  code: string;
}
