import { Module } from '@nestjs/common';
import PenaltyController from './penalty.controller';
import PenaltyService from './penalty.service';

@Module({
	controllers: [PenaltyController],
	providers: [PenaltyService],
	exports: [PenaltyService],
})
export default class PenaltyModule{};
