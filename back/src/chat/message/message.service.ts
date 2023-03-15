import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from 'ft_transcendence';

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
  )
  {}

  async createMessage(newMessage: Message, roomName: string) {
    const rep = await this.prisma.message.create({
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
    // console.log("for " + roomName + " = " + rep);
  }

  async getAllMessagesByRoomName(roomName: string) {
    // console.log("service = ", roomName);
    const message = await this.prisma.message.findMany({
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
    return message;
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
