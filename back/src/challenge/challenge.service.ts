import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Challenge, Game } from '@prisma/client';
import { GameService } from '../game/game.service';

@Injectable()
export class ChallengeService {
    constructor(private prisma: PrismaService,
			   private gameService: GameService) {}

	isAlreadyInGame(challenges: Challenge[], games: Game[], userId: number): boolean
	{
		for (let i = 0; i < challenges.length; ++i)
		{
			if (challenges[i].senderId === userId)
				return (true);
		}
		for (let i = 0; i < games.length; ++i)
		{
			if (games[i].leftPlayerId === userId ||
			   games[i].rightPlayerId === userId)
				return (true);
		}
		return (false);
	}

	async createChallenge(receiverId: number, senderId: number, powerUpMode: boolean)
	{
		const challenges = await this.getChallenges();
		const games = await this.gameService.getGames();

		if (!this.isAlreadyInGame(challenges, games, senderId))
		{
			const challenge = await this.prisma.challenge.create(
			{
				data : {
					powerUpMode: powerUpMode,
					receiver: {
						connect: {
							id: receiverId
						}
					},
					sender: {
						connect: {
							id: senderId
						}
					}
				}
			});
			return (challenge.id);
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async deleteChallenge(challengeId: number)
	{
		await this.prisma.challenge.delete(
		{
			where : {
				id: challengeId
			}
		});
	}

	async getChallenge(challengeId: number)
	{
		const challenge = await this.prisma.challenge.findUnique({
			where: {
				id: challengeId
			},
			include: {
				sender: true,
				receiver: true
			}
		});
		return (challenge);
	}

	async getChallenges()
	{
		const challenges = await this.prisma.challenge.findMany({
			include: {
				sender: true,
				receiver: true
			}
		});
		return (challenges);
	}
}
