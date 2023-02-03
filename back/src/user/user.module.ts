import { Module } from '@nestjs/common';
import { JwtStrategy } from '../auth/strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [UserController],
  providers: [JwtStrategy, UserService],
})
export class UserModule {}
