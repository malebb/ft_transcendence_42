import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistoryService } from './history.service';
import { GetUser } from '../auth/decorator';

@Controller('history')
class HistoryController
{
	constructor(private historyService: HistoryService) {}

	@Get('gamePlayed')
	async getGame(@GetUser('id') userId: number)
	{
		return (await this.historyService.getGamePlayed(userId));
	}

	@Get('achievementsDone')
	async getAchievementsDone(@GetUser('id') userId: number)
	{
		return (await this.historyService.getAchievementsDone(userId));
	}

}

export default HistoryController;
