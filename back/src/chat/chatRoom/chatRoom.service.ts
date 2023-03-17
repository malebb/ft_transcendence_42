import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PenaltyTimes, Accessibility, User } from 'ft_transcendence';
import { PrismaService } from 'src/prisma/prisma.service';
import { PenaltyDto } from '../penalty/Penalty';
import PenaltyService from '../penalty/penalty.service';
import { Penalty, PenaltyType } from '@prisma/client';
import { ChatRoomDto } from './ChatRoomDto';
import * as argon2 from 'argon2';

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

	isNameValid(name: string)
	{
		if (name.length < 4 || name.length > 25)
			return (false);
		if (!/^[A-Za-z0-9 ]*$/.test(name))
			return (false);
		return (true);
	}

	isAccessibilityValid(accessibility: Accessibility, password: string)
	{
		if (accessibility !== undefined)
		{
			if (accessibility === 'PROTECTED' ||
				accessibility === 'PRIVATE_PROTECTED' &&
				(/^[0-9]*$/).test(password) &&
			   password.length === 4)
				return (true);
			else if ((accessibility === 'PRIVATE' ||
					  accessibility === 'PUBLIC') &&
					  !password.length)
				return (true);
		}
		return (false);
	}

	async createChatRoom(chatRoom: ChatRoomDto, creatorId: number)
	{
		if (chatRoom.accessibility != undefined
			&& this.isNameValid(chatRoom.name)
		&& this.isAccessibilityValid(chatRoom.accessibility,
									  chatRoom.password))
		{
			if (await this.getChatRoom(chatRoom.name))
					throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			await this.prisma.chatRoom.create({
				data: {
					owner: {
						connect: {
							id: creatorId,
						}
					},
					admins: {
						connect: {
							id: creatorId,
						}
					},
					members: {
						connect: {
							id: creatorId,
						}
					},
					name: chatRoom.name,
					password: chatRoom.password.length ? await argon2.hash(chatRoom.password): '',
					accessibility: chatRoom.accessibility
				}
			})
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async checkPassword(chatRoomName: string, password: string, userId: number)
	{
		if (!userId)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		const room = await this.getChatRoom(chatRoomName);

		if (!((/^[0-9]*$/).test(password) && password.length === 4
			&& room.password.length && await argon2.verify(room.password, password)))
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

	async getPublicInfosFromChat(name: string, userId: number)
	{
		if (!userId)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: {
				name: name,
			},
			select: {
				accessibility: true,
				name: true,
				owner: {
					select: {id: true, username: true}
				},
				members: {
					select: {id: true, username: true}
				},
				admins: {
					select: {id: true}
				}
			}
		})
		return (chatRoom);
	}

	async getNotJoinedRooms(userId: number)
	{
		const chatRooms = await this.prisma.chatRoom.findMany({
			where: {
				members: {
					none : {
						id: userId
					}
				},
			},
			select: {
				accessibility: true,
				name: true,
				owner: {
					select: {username: true}
				},
				members: {
					select: {id: true}
				}
			}
		})
		return (chatRooms);
	}

	async getJoinedRooms(userId: number)
	{
		const chatRooms = await this.prisma.chatRoom.findMany({
			where: {
				members: {
					some: {
							id: userId,
					},
				},
			},
			select: {
				name: true,
				owner: {
					select: {username: true}
				},
				members: {
					select: {id: true}
				}
			}
		})
		return (chatRooms);
	}

	async joinChatRoom(chatRoomName: string, chatRoom: ChatRoomDto, userId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (!this.isMember(room.members, userId) && 
			(room.accessibility === 'PUBLIC'
			 || (chatRoom.password && chatRoom.password.length &&
			await argon2.verify(room.password, chatRoom.password))))
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
		 else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async getMember(userId: number, name: string)
	{
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: {
				name: name
			},
			select: {
				members: {
					where: {
						id: userId
					},
					select: {
						id: true,
					}
				}
			}
		})
		return (chatRoom.members);
	}

	async updateRoomPassword(chatRoomName: string, password: string, userId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isOwner(room.owner, userId) &&
		   (/^[0-9]*$/).test(password) && password.length === 4)
		{
			await this.prisma.chatRoom.update({
				where: {
					name: chatRoomName
				},
				data: {
					password: await argon2.hash(password),
				}
			});
			if (room.accessibility === 'PUBLIC')
				this.changeAccessibility(room.name, Accessibility.PROTECTED);
			else if (room.accessibility === 'PRIVATE')
				this.changeAccessibility(room.name, Accessibility.PRIVATE_PROTECTED);
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async removePassword(chatRoomName: string, userId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isOwner(room.owner, userId) &&
			room.password.length)
		{
			await this.prisma.chatRoom.update({
				where: {
					name: chatRoomName
				},
				data: {
					password: '',
				}
			});
			if (room.accessibility === 'PROTECTED')
				this.changeAccessibility(room.name, Accessibility.PUBLIC);
			else if (room.accessibility === 'PRIVATE_PROTECTED')
				this.changeAccessibility(room.name, Accessibility.PRIVATE);
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
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

	async getUsersMuted(chatRoomName: string, userId: number)
	{
		const room = await this.getChatRoom(chatRoomName);

		if (this.isMember(room.members, userId))
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
						select: {
							target: {
								select: {
									id: true
								}
							}
						}
					}
				}
			})
			const usersMuted = [];
			for (let i = 0; i < room.penalties.length; ++i)
			{
				usersMuted.push(room.penalties[i].target);
			}
			return (usersMuted);
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
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

	async myBan(chatRoomName: string, userId: number)
	{
		const ban = this.prisma.chatRoom.findUnique(
		{
			where: {
				name: chatRoomName
			},
			select: {
				penalties: {
					where : {
						targetId: userId,
						type: 'BAN'
					},
					select: {
						id: true,
						date: true,
						durationInMin: true
					}
				}
			}
		});
		return (ban);
	}
}
