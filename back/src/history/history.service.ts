import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistoryService {
    constructor(private prisma: PrismaService) {}

	async addGamePlayed(leftUsername: string, rightUsername, leftScore: number, rightScore: number)
	{
		const gamePlayed = await this.prisma.gamePlayed.create({
			data: {
				user: {
					connect : [{email: leftUsername}, {email: rightUsername}]
				},
				leftUsername: leftUsername,
				rightUsername: rightUsername,
				leftScore: leftScore,
				rightScore: rightScore,
			}
		})
	}

	async getGamePlayed(username: string)
	{
		const gamesPlayed = await this.prisma.user.findUnique({
			where : {
				email: username
			},
			select: {
				gamePlayed: true
			}
		});
		return (gamesPlayed);
	}

	async addAchievementDone(username: string, title: string, desc: string, )
	{
		const achievementDone = await this.prisma.achievementDone.create({
			data: {
				user: {
					connect : {
						email: username
					}
				},
				title: title,
				desc: desc
			}
		})
	}
}
