import { Controller, Get, Param} from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
class StatsController
{
	constructor(private statsService: StatsService) {}

	@Get(':username')
	async getGame(@Param('username') username: string)
	{
		return (await this.statsService.getStats(username));
	}

}

export default StatsController;
