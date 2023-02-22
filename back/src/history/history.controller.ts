import { Controller, Get, Param} from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
class HistoryController
{
	constructor(private historyService: HistoryService) {}

	@Get('gamePlayed/:username')
	async getGame(@Param('username') username: string)
	{
		return (await this.historyService.getGamePlayed(username));
	}
}

export default HistoryController;
