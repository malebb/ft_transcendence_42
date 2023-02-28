import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import StatsController from './stats.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [HttpModule],
	controllers: [StatsController],
	providers: [StatsService],
	exports: [StatsService]
})
export class StatsModule {};
