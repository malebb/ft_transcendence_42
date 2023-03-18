import { Module } from '@nestjs/common'

import { GatewayPong } from './pong.gateway';
import { PongService } from './pong.service';
import PongController from './pong.controller';
import { GameModule } from '../game/game.module';
import { StatsModule } from '../stats/stats.module';
import { HistoryModule } from '../history/history.module';
import { UserModule } from '../user/user.module';
import { ChallengeModule } from '../challenge/challenge.module';

@Module(
{
	imports: [GameModule, StatsModule, HistoryModule, UserModule, ChallengeModule],
	controllers: [PongController],
	providers : [GatewayPong, PongService]
})
export class PongModule{}
