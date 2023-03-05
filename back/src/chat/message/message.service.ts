import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from 'ft_transcendence';
import { ChatRoomService } from '../chatRoom/chatRoom.service';
import { ChatRoom } from 'ft_transcendence';
import { Socket, Server } from 'socket.io';


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


@Injectable()
export class MessageService {
  constructor(
	private prisma: PrismaService,
	private readonly chatRoomService: ChatRoomService
	) {}

  async createMessage(firstMessage: Message) {
    await this.prisma.message.create({
      data: {
		user: {
			connect: {
				email: firstMessage.user.email,
			}
		},
	    message: firstMessage.message,
		sendAt: new Date(),
      },
    });
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
  /* createRoom(client: Socket, room: ChatRoom)
  {
	  this.chatRoomService.createChatRoom(room);
  } */

  joinRoom(client: Socket, room: ChatRoom)
  {
	client.join(room.name);
	client.on('SEND_ROOM_MESSAGE', (message) => {
		client.to(room.name).emit('ROOM_MESSAGE', message);
		});
  // console.log(client);
  // console.log(this.userController.getMe(this.user));
  /*
  client.join(room.roomId);
  client.on('SEND_ROOM_MESSAGE', (message) => {
	client.to(room.roomId).emit('ROOM_MESSAGE', message);
	});
	*/
  //   https://gist.github.com/crtr0/2896891
  }

  async getAllMessages() {
    const message = await this.prisma.message.findMany();
    return message;
  }

}

/*
Prisma client est genere du prisma.schema

*/

