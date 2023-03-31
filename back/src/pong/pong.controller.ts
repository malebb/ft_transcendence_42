import { Controller, Patch, Body } from '@nestjs/common';
import { PongService } from './pong.service';
import { GetUser } from '../auth/decorator';

import { IsString, IsOptional } from 'class-validator';

class PongDto
{
	@IsOptional()
	@IsString()
	map: string;

	@IsOptional()
	@IsString()
	skin: string;
}

@Controller('pong')
export default class PongController
{
	constructor(private readonly pongService: PongService) {}

	@Patch('skin')
	updateSkin(@GetUser('id') userId: number,
			   @Body() pongDto: PongDto)
	{
		this.pongService.updateSkin(userId, pongDto.skin);
	}

	@Patch('map')
	updateMap(@GetUser('id') userId: number,
			  @Body() pongDto: PongDto)
	{
		this.pongService.updateMap(userId, pongDto.map);
	}
}
