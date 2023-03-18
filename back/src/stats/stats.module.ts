import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import StatsController from './stats.controller';
import { UserModule } from '../user/user.module';

@Module({
	imports: [UserModule],
	controllers: [StatsController],
	providers: [StatsService],
	exports: [StatsService]
})
export class StatsModule {};
