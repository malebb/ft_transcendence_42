import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
class HistoryController
{
	constructor(private historyService: HistoryService) {}

	@Get('gamePlayed/:id')
	async getGame(@Param('id', ParseIntPipe) id: number)
	{
		return (await this.historyService.getGamePlayed(id));
	}

	@Get('achievementsDone/:id')
	async getAchievementsDone(@Param('id', ParseIntPipe) id: number)
	{
		return (await this.historyService.getAchievementsDone(id));
	}

}

export default HistoryController;
