import { Controller, Body, Post } from '@nestjs/common';
import PenaltyService from './penalty.service';
import { PenaltyDto } from './Penalty';


@Controller('penalty')
export default class PenaltyController
{
	constructor(private readonly penaltyService: PenaltyService)
	{

	}

	@Post('')
	async createPenalty(@Body() penalty: PenaltyDto)
	{
		await this.penaltyService.createPenalty(penalty);
	}

};
