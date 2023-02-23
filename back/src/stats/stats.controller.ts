import { Controller, Get, Param} from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
class StatsController
{
	constructor(private statsService: StatsService) {}
/*
	@Get()
	async getRoot()
	{
		return (await this.statsService.getS());
	}
*/
}

export default StatsController;
