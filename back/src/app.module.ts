import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { PongModule } from './pong/pong.module';
import { GameModule } from './game/game.module';
import { HistoryModule } from './history/history.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard , RtGuard} from './auth/guard';
import { NestjsFormDataModule } from 'nestjs-form-data';
import  GameController from './game/game.controller';
import { ChatModule } from './chat/chat.module';
import { ChallengeModule } from './challenge/challenge.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true,}), AuthModule, UserModule, BookmarkModule, PrismaModule, PongModule, GameModule, HistoryModule, NestjsFormDataModule, ChatModule, ChallengeModule],
  controllers: [AppController, GameController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: JwtGuard,
  },
  /*{
    provide: APP_GUARD,
    useClass: RtGuard,
  },*/
],
})
export class AppModule {}
