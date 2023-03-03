import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from 'ft_transcendence';

@Injectable()
export class MessageService
{
    constructor(private prisma: PrismaService) {}

	async createMessage(message: Message)
	{
		await this.prisma.message.create({
			data: {
				message: message.message,
				username: message.username,
			}
		})
	}

	// async getMessage(name: string)
	// {
	// 	const message = await this.prisma.message.findUnique({
	// 		where: {
	// 			name: name,
	// 		}
	// 	})
	// 	return (message);
	// }

	async getAllMessages()
	{
		const message = await this.prisma.message.findMany();
		return (message);
	}
}
