import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
class GameController
{
	constructor(private gameService: GameService) {}

	@Get()
	async getGames()
	{
		return (await this.gameService.getGames());
	}
}

export default GameController;
