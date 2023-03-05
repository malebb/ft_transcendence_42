import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoom } from 'ft_transcendence';
import { Accessibility } from 'ft_transcendence';

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

	async getNotJoinedRooms(username: string)
	{
		const chatRoom = await this.prisma.chatRoom.findMany({
			where: {
				members: {
					none : {
						email: username
					}
				},
			},
			include: {
				owner: true
			}
		})
		return (chatRoom);
	}

	async getJoinedRooms(username: string)
	{
		const chatRoom = await this.prisma.chatRoom.findMany({
			where: {
				members: {
					some: {
							email: username,
					},
				},
			},
			include: {
				owner: true
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

	async getMember(userId: number, name: string)
	{
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: {
				name: name
			},
			include: {
				members: {
					where: {
						id: userId
					}
				}
			}
		})
		return (chatRoom);
	}

	async getOwner(name: string)
	{
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: {
				name: name
			},
			include: {
				owner: true
			}
		})
		return (chatRoom);
	}
	async getMemberFromRoom(userId: number, name: string)
	{
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: {
				name: name
			},
			include: {
				members: {
					where: {
						id: userId
					}
				}
			}
		})
		return (chatRoom);
	}

	async getMembers(chatRoomName: string)
	{
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: {
				name: chatRoomName,
			},
			include: {
				members: {
					orderBy: {
						username: 'asc'
					}
				}
			}
		})
		return (chatRoom);
	}

	async updateRoomPassword(chatRoomName: string, password: string)
	{
		await this.prisma.chatRoom.update({
			where: {
				name: chatRoomName
			},
			data: {
				password: password,
			}
		});
	}

	async removePassword(chatRoomName: string)
	{
		await this.prisma.chatRoom.update({
			where: {
				name: chatRoomName
			},
			data: {
				password: '',
			}
		});
	}

	async changeAccessibility(chatRoomName: string, accessibility: Accessibility)
	{
		await this.prisma.chatRoom.update({
			where: {
				name: chatRoomName
			},
			data: {
				accessibility: accessibility
			}
		});
	}

}
