import { Controller, Post, Body, Get, Param, ParseIntPipe} from '@nestjs/common';
import { ChallengeService } from './challenge.service';

interface ChallengeDto
{
	powerUpMode: boolean;
	senderId: number;
	receiverId: number;
}

@Controller('challenge')
class ChallengeController
{
	constructor(private challengeService: ChallengeService) {}

	@Post('')
	async createChallenge(@Body() challenge: ChallengeDto)
	{
		return (await this.challengeService.createChallenge(challenge.receiverId, challenge.senderId, challenge.powerUpMode));
	}

	@Get('/:id')
	async getChallenge(@Param('id', ParseIntPipe) challengeId: number)
	{
		return (await this.challengeService.getChallenge(challengeId));
	}
}

export default ChallengeController;
