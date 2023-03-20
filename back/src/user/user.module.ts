import { Module } from '@nestjs/common';
import { JwtStrategy } from '../auth/strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UserGateway } from './user.gateway';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [UserController],
  providers: [JwtStrategy, UserService, UserGateway],
  exports: [UserService],
})
export class UserModule {}
