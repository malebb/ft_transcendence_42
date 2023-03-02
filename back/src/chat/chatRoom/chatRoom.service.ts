import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoom } from 'ft_transcendence';

@Injectable()
export class ChatRoomService
{
    constructor(private prisma: PrismaService) {}

	async createChatRoom(chatRoom: ChatRoom)
	{
		await this.prisma.chatRoom.create({
			data: {
				owner: {
					connect: {
						email: chatRoom.owner.email,
					}
				},
				admins: {
					connect: {
						email: chatRoom.owner.email,
					}
				},
				members: {
					connect: {
						email: chatRoom.owner.email,
					}
				},
				name: chatRoom.name,
				password: chatRoom.password,
				accessibility: chatRoom.accessibility
			}
		})
	}

	async getChatRoom(name: string)
	{
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: {
				name: name,
			}
		})
		return (chatRoom);
	}

	async getAllRooms()
	{
		const chatRoom = await this.prisma.chatRoom.findMany({
			include: {
				owner: true
			}
		})
		return (chatRoom);
	}

	async joinChatRoom(chatRoomName: string, username: string)
	{
		await this.prisma.user.update({
			where: {
				email: username
			},
			data : {
				memberChats : {
					connect : {
						name: chatRoomName
					}
				}
			}
		});
	}
}
