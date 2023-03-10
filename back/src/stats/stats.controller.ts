import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
class StatsController
{
	constructor(private statsService: StatsService) {}

	@Get(':id')
	async getStats(@Param('id', ParseIntPipe) id: number)
	{
		return (await this.statsService.getStats(id));
	}

}

export default StatsController;
