import { Controller, Get, Param} from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
class GameController
{
	constructor(private gameService: GameService) {}

	@Get(':id')
	getGame(@Param('id') id: string)
	{
		console.log('id = ', id);
		return ("");
	}

	@Get()
	async getRoot()
	{
		return (await this.gameService.getGames());
	}
}

export default GameController;
