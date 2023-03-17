import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PenaltyDto } from './Penalty';

@Injectable()
export default class PenaltyService
{
	constructor(private readonly prisma: PrismaService) {}

	// checks

	isPenaltyFinished(startPenaltyTime: Date, penaltyDurationInMin: number): boolean
	{
		const endPenaltyTime = new Date(startPenaltyTime.getTime() + penaltyDurationInMin * 60000);
		const currentTime = new Date(Date.now());

		if (endPenaltyTime > currentTime)
			return (false);
		return (true);
	}

	// CRUD

	async createPenalty(penalty: PenaltyDto, authorId: number)
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
						id: authorId
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

	async getPenalty(penaltyId: number)
	{
		const penalty = await this.prisma.penalty.findUnique({
			where: {
				id: penaltyId
			}
		});
		return (penalty);
	}

	async deletePenalty(penaltyId: number, userId: number)
	{
		const penalty = await this.getPenalty(penaltyId);

		if (penalty && penalty.targetId === userId && this.isPenaltyFinished(penalty.date, penalty.durationInMin))
		{
			await this.prisma.penalty.delete({
				where: {
					id: penaltyId
				}
			});
		}
		else
		{
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		}
	}

	async deletePenalties(chatId: number, userId: number)
	{
		await this.prisma.penalty.deleteMany({
			where: {
				targetId: userId,
				chatId: chatId
			}
		});
	}
};
