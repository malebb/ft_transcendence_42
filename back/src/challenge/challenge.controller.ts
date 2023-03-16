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
	async createChallenge(@Body() challenge: ChallengeDto, @GetUser('id') authorId: number)
	{
		return (await this.challengeService.createChallenge(challenge.receiverId, authorId, challenge.powerUpMode));
	}

	@Get('/:id')
	async getChallenge(@Param('id', ParseIntPipe) challengeId: number)
	{
		return (await this.challengeService.getChallenge(challengeId));
	}

	@Delete(':id')
	async deletechallenge(@Param('id', ParseIntPipe) challengeId: number)
	{
		await (this.challengeService.deleteChallenge(challengeId))
	}

	@Get('')
	async getChallenges()
	{
		return (await this.challengeService.getChallenges());
	}
}

export default ChallengeController;
