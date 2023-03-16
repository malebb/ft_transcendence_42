import { Controller, Body, Post, Param, Delete,
ParseIntPipe } from '@nestjs/common';
import PenaltyService from './penalty.service';
import { PenaltyDto } from './Penalty';


@Controller('penalty')
export default class PenaltyController
{
	constructor(private readonly penaltyService: PenaltyService)
	{

	}

	@Delete(':id')
	async deletePenalty(@Param('id', ParseIntPipe) penaltyId: number)
	{
		await this.penaltyService.deletePenalty(penaltyId);
	}
};
