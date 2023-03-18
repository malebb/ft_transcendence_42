import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistoryService {
	constructor(private prisma: PrismaService) { }

	async addGamePlayed(leftId: number, rightId: number, leftScore: number, rightScore: number) {
		await this.prisma.gamePlayed.create({
			data: {
				user: {
					connect: [{ id: leftId }, { id: rightId }]
				},
				leftPlayer: {
					connect: {
						id: leftId
					}
				},
				rightPlayer: {
					connect: {
						id: rightId
					}
				},
				leftScore: leftScore,
				rightScore: rightScore,
			}
		})
	}

	async getGamePlayed(id: number)
	{
		const gamesPlayed = await this.prisma.user.findUnique({
			where: {
				id: id
			},
			select: {
				gamePlayed: {
					include: {
						leftPlayer: {
							select: {id: true, username: true}
						},
						rightPlayer: {
							select: {id: true, username: true}
						}
					}
				}
			}
		});
		return (gamesPlayed);
	}

	async addAchievementDone(userId: number, title: string, desc: string,) {
		await this.prisma.achievementDone.create({
			data: {
				user: {
					connect: {
						id: userId
					}
				},
				title: title,
				desc: desc
			}
		})
	}

	async getAchievementsDone(id: number)
	{
		const achievementsDone = await this.prisma.user.findUnique({
			where: {
				id: id
			},
			select: {
				achievementDone: true
			}
		});
		return (achievementsDone);
	}
}
