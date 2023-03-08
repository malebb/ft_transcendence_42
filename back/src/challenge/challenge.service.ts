import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChallengeService {
    constructor(private prisma: PrismaService) {}
	async createChallenge(receiverId: number, senderId: number, powerUpMode: boolean)
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
		return (challenge);
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
}
