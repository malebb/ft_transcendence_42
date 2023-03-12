import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService)
    {
	}

	async addVictory(userId: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId
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

	async addDefeat(userId: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId
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

	async addXp(userId: number, amount: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId 
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

	async addLevel(userId: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId
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

	async updateLevel(userId: number, newLevel: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId
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

	async updateModeExplorer(userId: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId
			},
			data: {
				stats: {
					update: {
						modeExplorer: true
					}
				}
			}
		})
	}

	async updateFashionWeek(userId: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId
			},
			data: {
				stats: {
					update: {
						fashionWeek: true
					}
				}
			}
		})
	}

	async updateTraveler(userId: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId
			},
			data: {
				stats: {
					update: {
						traveler: true
					}
				}
			}
		})
	}

	async updateFailureKnowledge(userId: number)
	{
		await this.prisma.user.update(
		{
			where: {
					id: userId
			},
			data: {
				stats: {
					update: {
						failureKnowledge: true
					}
				}
			}
		})
	}

	async getStats(id: number)
	{
		const getUser = await this.prisma.user.findUnique(
		{
  			where: {
				id: id,
  			},
			select: {
				stats: true
			}
  		});
		return (getUser.stats);
	}
}
