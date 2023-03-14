import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoom } from 'ft_transcendence';
import { Accessibility } from 'ft_transcendence';
import * as argon2 from 'argon2';

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
						id: chatRoom.owner.id,
					}
				},
				admins: {
					connect: {
						id: chatRoom.owner.id,
					}
				},
				members: {
					connect: {
						id: chatRoom.owner.id,
					}
				},
				name: chatRoom.name,
				password: chatRoom.password.length ? await argon2.hash(chatRoom.password): '',
				accessibility: chatRoom.accessibility
			}
		})
	}

	async checkPassword(chatRoomName: string, password: string)
	{
		const room = await this.prisma.chatRoom.findUnique({
			where: {
				name: chatRoomName
			}
		});

		if (!(await argon2.verify(room.password, password)))
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async getChatRoom(name: string)
	{
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: {
				name: name,
			},
			include: {
				owner: true,
				admins: true,
				penalties: {
					include: {
						author: true,
						target: true,
					}
				},
				members: {
					orderBy: {
						username: 'asc'
					}
				}
			}
		})
		return (chatRoom);
	}

	async getNotJoinedRooms(userId: number)
	{
		const chatRoom = await this.prisma.chatRoom.findMany({
			where: {
				members: {
					none : {
						id: userId
					}
				},
			},
			include: {
				owner: true
			}
		})
		return (chatRoom);
	}

	async getJoinedRooms(userId: number)
	{
		const chatRoom = await this.prisma.chatRoom.findMany({
			where: {
				members: {
					some: {
							id: userId,
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

	async joinChatRoom(chatRoomName: string, userId: number)
	{
		await this.prisma.user.update({
			where: {
				id: userId
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

	async updateRoomPassword(chatRoomName: string, password: string)
	{
		await this.prisma.chatRoom.update({
			where: {
				name: chatRoomName
			},
			data: {
				password: await argon2.hash(password),
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

	async removeUserFromRoom(userId: number, chatRoomName: string)
	{
		await this.prisma.chatRoom.update({
			where: {
				name: chatRoomName
			},
			data: {
				members: { disconnect: [{id: userId}],
				},
				admins: { disconnect: [{id: userId}],
				}
			}
		});
	}

	async updateOwner(chatRoomName: string, userId: number)
	{
		await this.prisma.chatRoom.update({
			where: {
				name: chatRoomName
			},
			data: {
				owner: {
					connect: {
						id: userId,
					}
				},
				admins: {
					connect: {
						id: userId,
					}
				},
			}
		});
	}

	async addAdmin(chatRoomName: string, userId: number)
	{
		await this.prisma.chatRoom.update({
			where: {
				name: chatRoomName
			},
			data: {
				admins: {
					connect: {
						id: userId,
					}
				},
			}
		});
	}

	async removeAdmin(userId: number, chatRoomName: string)
	{
		await this.prisma.chatRoom.update({
			where: {
				name: chatRoomName
			},
			data: {
				admins: { disconnect: [{id: userId}]}
			}
		});
	}

	async getUserPenalties(chatRoomName: string, userId: number)
	{
		const penalties = this.prisma.chatRoom.findUnique({
			where: {
				name: chatRoomName
			},
			include: {
				penalties: {
					where : {
						targetId: userId
					}
				}
			}
		});
		return (penalties);
	}

	async getMutes(chatRoomName: string)
	{
		const mutes = this.prisma.chatRoom.findUnique({
			where: {
				name: chatRoomName
			},
			include: {
				penalties: {
					where: {
						type: 'MUTE'
					},
					include: {
						target: true
					}
				}
			}
		})
		return (mutes);
	}
}
