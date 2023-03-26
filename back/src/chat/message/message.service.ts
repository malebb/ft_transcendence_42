import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoom, Message, User } from 'ft_transcendence';
import { PrivateMessage, MessageType } from '@prisma/client';
import { ChatRoomService } from '../chatRoom/chatRoom.service';
import { HttpStatus, HttpException } from '@nestjs/common';
import PenaltyService from '../penalty/penalty.service';
import { UserService } from '../../user/user.service';

// Database, model Message:
// relation 1-1 avec la ChatRoomService
// Les champs userId et chatRoomId n'existe pas dans la db
// Ce sont les "foreign key" pour connecter Message avec
// les 2 autres models
// Dans les champs user et room, on a 2 champs de relation
// (fields: [userId]/[chatRoomId], references: [id])
// Ils sont utilise pour generer Prisma Client
// et n'existent pas dans la db
// Les foreign key ne sont stockes que dans un seul cote
// de la relation
// Dans notre exemple, Message a une primary key (id),
// et chatRoomId/userId font reference a la primary key
// du model chatRoom/User
// La relation est representee par le lien entre ces deux clefs

// @Controller('messages')
@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
	private readonly chatRoomService: ChatRoomService,
	private readonly penaltyService: PenaltyService,
	private readonly userService: UserService,
  )
  {}

  async createPrivateRoom(
    senderId: number,
    receiverId: number,
  ) {
   		let privateRoom = await this.checkIfPrivateConvExist(senderId, receiverId);
    	if (privateRoom === null)
		{
  		  	privateRoom = await this.prisma.privateMessage.create({
      		data: {
        			sender: {
    					connect: {
            				id: senderId,
         				},
        			},
        			receiver: {
         				connect: {
           					id: receiverId,
    					},
    				},
				},
			});
	    	privateRoom = await this.prisma.privateMessage.update({
    	  		where: {
    				id: privateRoom.id,
    			},
     			 data: {
					name: String(privateRoom.id),
				},
	    	});
		}

	return privateRoom;
}

	async updatePrivateConv(room: number, newMessage: string, senderId: number, receiverId: number, type: MessageType, challengeId: number)
	{
		let privateRoom = await this.checkIfPrivateConvExist(senderId, receiverId);

		if (privateRoom)
		{
			const updateConv = await this.prisma.privateMessage.update({
				where: {
					id: room,
				},
				data: {
					message: {
						create: [
							{
								user: {
									connect: {
										id: senderId,
									},
								},
								message: newMessage,
								sendAt: new Date(),
								type: type,
								challengeId: challengeId,
							},
						],
					},
				},
				include: {
					message: true,
				},
			});
			return updateConv;
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  async createMessage(newMessage: Message, roomName: string, userId: number)
  {
		const room = await this.chatRoomService.getChatRoom(roomName);
		const mute = await this.chatRoomService.myMute(roomName, userId);

		if (room && this.chatRoomService.isMember(room.members, userId))
		{
			if (mute.penalties.length)
			{
				const penaltyTimeInMin = mute.penalties[0].durationInMin;
				const startPenaltyTime = new Date(mute.penalties[0].date);
				const endPenaltyTime = new Date(startPenaltyTime.getTime() + penaltyTimeInMin * 60000)
				const currentTime = new Date(Date.now());
				const msToEnd  = endPenaltyTime.getTime() - currentTime.getTime();
				if (msToEnd <= 0)
					this.penaltyService.deletePenalty(mute.penalties[0].id, userId);
				else
					throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

			}
		    await this.prisma.message.create({
    			data: {
        			user: {
          				connect: {
          					  email: newMessage?.user?.email,
       					},
        			},
       				message: newMessage.message,
       				room: {
          				connect: {
           					name: roomName,
          				},
        			},
        			sendAt: new Date(),
      			},
    		});
   			return newMessage;
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
/*
  isBlocked(blocked: User[], userToCheck: User): boolean
  {
		for (let i = 0; i < blocked.length; ++i)
		{
			if 
		}
  }
  */

  async getAllMessagesByRoomName(roomName: string, userId: number)
  {
	const blocked  = await this.userService.getAllBlocked(userId);

    const messages = await this.prisma.message.findMany({
      where: {
        room: {
          name: roomName,
        },
      },
      orderBy: {
        sendAt: 'asc',
      },
      include: {
        user: true,
        room: true,
      },
    });

	for (let i = 0; i < blocked.length; ++i)
	{
		for (let j = 0; j < messages.length; ++j)
		{
			if (messages[j].user.id === blocked[i].id)
			{
				messages.splice(j, 1);
				j--;
			}
		}
	}
    return messages;
  }

  async getAllMessagesFromPrivate(userId: number, myId: number)
  {
	const privateRoom = await this.checkIfPrivateConvExist(userId, myId);
	if (privateRoom)
	{
		const blocked  = await this.userService.getAllBlocked(userId);

		const messages = await this.prisma.message.findMany(
		{
   	 		where: {
     			PrivateMessage: {
       		   name: privateRoom.name,
       		 },
      		},
    		  orderBy: {
    		    sendAt: 'asc',
		      },
   		 	  include: {
   	    	 	user: true,
   		 	    room: true,
		      },
		    });

			for (let i = 0; i < blocked.length; ++i)
			{
				for (let j = 0; j < messages.length; ++j)
				{
					if (messages[j].user.id === blocked[i].id)
					{
						messages.splice(j, 1);
						j--;
					}
				}
			}
    	return messages;
	}
	else
		throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  async deleteAllMessagesByRoomName(roomName: string) {
    const deleteMessages = await this.prisma.message.deleteMany({
      where: {
        room: {
          name: roomName,
        },
      },
    });

    return roomName;
  }

  async checkIfPrivateConvExist(userId1: number, userId2: number) {
    const conv = await this.prisma.privateMessage.findFirst({
      where: {
        OR: [
          {
            AND: {
              sender: {
                id: userId1,
              },
              receiver: {
                id: userId2,
              },
            },
          },
          {
            AND: {
              sender: {
                id: userId2,
              },
              receiver: {
                id: userId1,
              },
            },
          },
        ],
      },
    });

    return conv;
  }
}

/*
Prisma client est genere du prisma.schema

*/
