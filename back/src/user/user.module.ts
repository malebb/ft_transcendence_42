import { Module } from '@nestjs/common';
import { JwtStrategy } from '../auth/strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [JwtStrategy, UserService],
})
export class UserModule {}
