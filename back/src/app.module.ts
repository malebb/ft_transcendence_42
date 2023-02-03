import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { PongModule } from './pong/pong.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/guard';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true,}), AuthModule, UserModule, BookmarkModule, PrismaModule, PongModule, NestjsFormDataModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: JwtGuard,
  },
],
})
export class AppModule {}
