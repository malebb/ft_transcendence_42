import { Controller, Post, Body, Get, Param, ParseIntPipe, Delete} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { GetUser } from '../auth/decorator';

interface ChallengeDto
{
	powerUpMode: boolean;
	receiverId: number;
}

@Controller('challenge')
class ChallengeController
{
	constructor(private challengeService: ChallengeService) {}

	@Post('')
	async createChallenge(@Body() challenge: ChallengeDto,
						  @GetUser('id') authorId: number)
	{
		return (await this.challengeService.createChallenge(challenge.receiverId, authorId, challenge.powerUpMode));
	}

	@Get('/:id')
	async getChallenge(@Param('id', ParseIntPipe) challengeId: number,
					   @GetUser('id') userId: number)
	{
		return (await this.challengeService.getChallenge(challengeId, userId));
	}

	@Delete(':id')
	async deletechallenge(@Param('id', ParseIntPipe) challengeId: number,
						  @GetUser('id') userId: number)
	{
		await (this.challengeService.deleteChallenge(challengeId, userId))
	}
}

export default ChallengeController;
