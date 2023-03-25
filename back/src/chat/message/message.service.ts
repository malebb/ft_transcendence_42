import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message, User } from 'ft_transcendence';
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
    sender: User,
    receiver: User,
  ) {
    const privateMessage = await this.prisma.privateMessage.create({
      data: {
        sender: {
          connect: {
            id: sender.id,
          },
        },
        receiver: {
          connect: {
            id: receiver.id,
          },
        },
      },
    });
    const room = await this.prisma.privateMessage.update({
      where: {
        id: privateMessage.id,
      },
      data: {
        name: String(privateMessage.id),
      },
    });

    return room;
  }

  async updatePrivateConv(room: number, newMessage: Message, sender: User) {
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
                  id: sender.id,
                },
              },
              message: newMessage.message,
              sendAt: new Date(),
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

  async getAllPrivateRoomMessagesByRoomId(roomId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        privateMessage: {
			id: roomId,
		},
      },
      orderBy: {
        sendAt: 'asc',
      },
      include: {
        user: true,
      },
    });

    return messages;
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

  async checkIfPrivateConvExist(user1: User, user2: User) {
    const conv = await this.prisma.privateMessage.findFirst({
      where: {
        OR: [
          {
            AND: {
              sender: {
                id: user1.id,
              },
              receiver: {
                id: user2.id,
              },
            },
          },
          {
            AND: {
              sender: {
                id: user2.id,
              },
              receiver: {
                id: user1.id,
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
