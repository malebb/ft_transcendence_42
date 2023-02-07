import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { PongModule } from './pong/pong.module';

@Module({
  imports: [
	ConfigModule.forRoot({isGlobal: true,}), 
	AuthModule, 
	UserModule, 
	BookmarkModule, 
	PrismaModule, 
	PongModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
