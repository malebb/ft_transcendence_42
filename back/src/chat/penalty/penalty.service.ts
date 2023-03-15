import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PenaltyDto } from './Penalty';

@Injectable()
export default class PenaltyService
{
	constructor(private readonly prisma: PrismaService) {}
	async createPenalty(penalty: PenaltyDto)
	{
		await this.prisma.penalty.create({
			data: {
				date: new Date(Date.now()),
				chat: {
					connect: {
						name: penalty.roomName
					}
				},
				author: {
					connect: {
						id: penalty.authorId
					}
				},
				target: {
					connect: {
						id: penalty.targetId
					}
				},
				type: penalty.type,
				durationInMin: penalty.durationInMin
			}
		});
	}

	async deletePenalty(penaltyId: number)
	{
		await this.prisma.penalty.delete({
			where: {
				id: penaltyId
			}
		});
	}
};