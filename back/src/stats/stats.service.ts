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

	async updateModeExplorer(username: string)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
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

	async updateFashionWeek(username: string)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
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

	async updateTraveler(username: string)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
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

	async updateFailureKnowledge(username: string)
	{
		await this.prisma.user.update(
		{
			where: {
					email: username
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

	async getStats(username: string)
	{
		const getUser = await this.prisma.user.findUnique(
		{
  			where: {
				email: username,
  			},
			select: {
				stats: true
			}
  		});
		return (getUser.stats);
	}
}
