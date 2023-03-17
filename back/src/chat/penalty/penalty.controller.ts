import { Controller, Body, Post, Param, Delete,
ParseIntPipe } from '@nestjs/common';
import PenaltyService from './penalty.service';
import { PenaltyDto } from './Penalty';
import { GetUser } from '../../auth/decorator';


@Controller('penalty')
export default class PenaltyController
{
	constructor(private readonly penaltyService: PenaltyService)
	{

	}

	@Delete(':id')
	async deletePenalty(@Param('id', ParseIntPipe) penaltyId: number,
					   @GetUser('id') userId: number)
	{
		await this.penaltyService.deletePenalty(penaltyId, userId);
	}
};
