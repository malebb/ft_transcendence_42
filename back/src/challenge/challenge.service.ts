import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChallengeService {
    constructor(private prisma: PrismaService) {}
	async createChallenge(receiverId: number, senderId: number, powerUpMode: boolean)
	{
		console.log(senderId, ' ', receiverId, ' ', powerUpMode);
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
