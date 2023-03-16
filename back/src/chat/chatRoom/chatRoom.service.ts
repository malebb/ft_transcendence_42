import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoom, PenaltyTimes, Accessibility, User } from 'ft_transcendence';
import * as argon2 from 'argon2';
import { PenaltyDto } from '../penalty/Penalty';
import PenaltyService from '../penalty/penalty.service';
import { Penalty, PenaltyType } from '@prisma/client';

@Injectable()
export class ChatRoomService
{
    constructor(private prisma: PrismaService,
			   	private readonly penaltyService: PenaltyService) {}

	// checks
	
	isOwner(owner: User, userId: number): boolean
	{
		return (owner.id == userId);
	}

	isMember(members: User[], userId: number): boolean
	{
		for (let i = 0; i < members.length; ++i)
		{
			if (members[i].id === userId)
				return (true);
		}
		return (false)
	}

	isAdmin(admins: User[], userId: number): boolean
	{
		for (let i = 0; i < admins.length; ++i)
		{
			if (admins[i].id === userId)
				return (true);
		}
		return (false)
	}

	isSanctioned(penalties: Penalty[], userId: number, type : PenaltyType): boolean
	{
		for (let i = 0; i < penalties.length; ++i)
		{
			if (penalties[i].targetId === userId
				&& penalties[i].type === type)
				return (true);
		}
		return (false);
	}

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
				owner: true,
				members: true
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
				owner: true,
				members: true
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
		return (chatRoom.members);
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

	async removeMember(chatRoomName: string, userId: number)
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

	async makeOwner(chatRoomName: string, userId: number, authorId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isOwner(room.owner, authorId) &&
		   	this.isMember(room.members, userId))
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
					}
				}
			});
			this.penaltyService.deletePenalties(room.id, userId);
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async makeAdmin(chatRoomName: string, userId: number, authorId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isOwner(room.owner, authorId) &&
		   	!this.isAdmin(room.admins, userId))
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
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async removeAdmin(userId: number, chatRoomName: string, authorId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isOwner(room.owner, authorId) &&
		   	this.isAdmin(room.admins, userId))
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
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async getUserPenalties(chatRoomName: string, userId: number)
	{
		const penalties = this.prisma.chatRoom.findUnique({
			where: {
				name: chatRoomName
			},
			select: {
				penalties: {
					where : {
						targetId: userId
					}
				}
			}
		});
		return (penalties);
	}

	async getUsersMuted(chatRoomName: string)
	{
		const room = await this.prisma.chatRoom.findUnique({
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
		const usersMuted: User[] = [];
		for (let i = 0; i < room.penalties.length; ++i)
		{
			usersMuted.push(room.penalties[i].target);
		}
		return (usersMuted);
	}

	async penalty(chatRoomName: string, penalty: PenaltyDto, authorId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isAdmin(room.admins, authorId) &&
			this.isMember(room.members, penalty.targetId) &&
		   !this.isOwner(room.owner, penalty.targetId) &&
		   PenaltyTimes.includes(penalty.durationInMin))
		{
				if (penalty.type === 'BAN' && !this.isSanctioned(room.penalties, penalty.targetId, penalty.type))
				{
					this.removeMember(chatRoomName, penalty.targetId);
					this.penaltyService.createPenalty(penalty, authorId);
				}
				else if (penalty.type === 'MUTE' && !this.isSanctioned(room.penalties, penalty.targetId, penalty.type))
				{
					this.penaltyService.createPenalty(penalty, authorId);
				}
				else
					throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async leaveRoom(chatRoomName: string, userId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isMember(room.members, userId) && 
		   !this.isOwner(room.owner, userId))
		{
			this.removeMember(chatRoomName, userId);
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async kick(chatRoomName: string, userId: number, authorId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isAdmin(room.admins, authorId) &&
		   this.isMember(room.members, userId) &&
		   !this.isOwner(room.owner, userId))
		{
			await this.removeMember(chatRoomName, userId);
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
