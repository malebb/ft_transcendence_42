import { Module } from '@nestjs/common'

import { GatewayPong } from './pong.gateway';
import { PongService } from './pong.service';

@Module(
{
	providers : [ GatewayPong, PongService]
})
export class PongModule{}
