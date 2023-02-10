import { Module } from '@nestjs/common'

import { GatewayPong } from './pong.gateway';
import { PongService } from './pong.service';
import { GameModule } from '../game/game.module';

@Module(
{
	imports: [GameModule],
	providers : [GatewayPong, PongService]
})
export class PongModule{}
