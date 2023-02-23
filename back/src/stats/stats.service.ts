import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService)
    {
	}

	async addVictory(username: string)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
			},
			data: {
				stats: {
					update: {
						victory: {
							increment: 1
						}
					}
				}
			}
		})
	}

	async addDefeat(username: string)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
			},
			data: {
				stats: {
					update: {
						defeat: {
							increment: 1
						}
					}
				}
			}
		})
	}

	async addXp(username: string, amount: number)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
			},
			data: {
				stats: {
					update: {
						xp: {
							increment: amount
						}
					}
				}
			}
		})
	}

	async addLevel(username: string)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
			},
			data: {
				stats: {
					update: {
						level: {
							increment: 1
						}
					}
				}
			}
		})
	}

	async getStats(userId: number)
	{
		return (await this.prisma.stats.findMany());
	}

	async getXp(username: string)
	{
		let user = await this.prisma.user.findUnique({
			where: {
				email: username
			},
			select: {
				stats: {
					select: {
						xp: true
					}
				}
			}
		});
		return (user.stats.xp);
	}

	async getLevel(username: string)
	{
		let user = await this.prisma.user.findUnique({
			where: {
				email: username
			},
			select: {
				stats: {
					select: {
						level: true
					}
				}
			}
		});
		return (user.stats.level);
	}

	async updateLevel(username: string, newLevel: number)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
			},
			data: {
				stats: {
					update: {
						level: newLevel
					}
				}
			}
		})
	}
}
