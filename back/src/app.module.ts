import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { PongModule } from './pong/pong.module';
import { GameModule } from './game/game.module';
import { HistoryModule } from './history/history.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard, RtGuard } from './auth/guard';
import { NestjsFormDataModule } from 'nestjs-form-data';
import GameController from './game/game.controller';
import { ChallengeModule } from './challenge/challenge.module';
import { ChatRoomModule } from './chat/chatRoom/chatRoom.module';
import { MessageModule } from './chat/message/message.module';
import PenaltyModule from './chat/penalty/penalty.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    PongModule,
    GameModule,
    HistoryModule,
    NestjsFormDataModule,
    ChatRoomModule,
    MessageModule,
    ChallengeModule,
    PenaltyModule,
  ],
  controllers: [AppController, GameController],
  providers: [
    AppService,
    {
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
