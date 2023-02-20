import { Module } from '@nestjs/common'

import { GatewayPong } from './pong.gateway';
import { PongService } from './pong.service';
import { GameModule } from '../game/game.module';
import { StatsModule } from '../stats/stats.module';

@Module(
{
	imports: [GameModule, StatsModule],
	providers : [GatewayPong, PongService]
})
export class PongModule{}
