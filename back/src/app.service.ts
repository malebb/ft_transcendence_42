import { Injectable, OnModuleInit } from '@nestjs/common';
import { GameService } from './game/game.service';
import { ChallengeService } from './challenge/challenge.service';

@Injectable()
export class AppService implements OnModuleInit{

	constructor(private readonly gameService: GameService,
			   private readonly challengeService: ChallengeService) {};

	onModuleInit()
	{
		this.gameService.removeAllGames();
		this.challengeService.removeAllChallenge();
	}
}
