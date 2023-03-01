import { Module } from '@nestjs/common'

import { GatewayPong } from './pong.gateway';
import { PongService } from './pong.service';
import { GameModule } from '../game/game.module';
import { StatsModule } from '../stats/stats.module';
import { HistoryModule } from '../history/history.module';
import { UserModule } from '../user/user.module';

@Module(
{
	imports: [GameModule, StatsModule, HistoryModule, UserModule],
	providers : [GatewayPong, PongService]
})
export class PongModule{}
