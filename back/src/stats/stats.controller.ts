import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';
import { GetUser } from '../auth/decorator';

@Controller('stats')
class StatsController {
  constructor(private statsService: StatsService) {}

  @Get(':statsId')
  async getStats(
    @Param('statsId', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return await this.statsService.getStats(id, userId);
  }
}

export default StatsController;
