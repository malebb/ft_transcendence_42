import { Module } from '@nestjs/common'

import { GatewayPong } from './pong.gateway';

@Module(
{
	providers : [ GatewayPong ]
})
export class PongModule{}
