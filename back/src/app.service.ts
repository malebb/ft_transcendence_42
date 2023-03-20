import { Injectable, OnModuleInit } from '@nestjs/common';
import { GameService } from './game/game.service';

@Injectable()
export class AppService implements OnModuleInit{

	constructor(private readonly gameService: GameService) {};

	onModuleInit()
	{
		this.gameService.removeAllGames();
	}
}
