import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from 'ft_transcendence';
import { ChatRoomService } from '../chatRoom/chatRoom.service';
import { HttpStatus, HttpException } from '@nestjs/common';
import PenaltyService from '../penalty/penalty.service';

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
	private readonly penaltyService: PenaltyService
  )
  {}

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

  async getAllMessagesByRoomName(roomName: string) {
    // console.log("service = ", roomName);
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
    // console.log(message);
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
  }
}

/*
Prisma client est genere du prisma.schema

*/
