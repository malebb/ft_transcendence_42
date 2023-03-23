import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRoom, Message, User } from 'ft_transcendence';
import { PrivateMessage } from '@prisma/client';

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
  constructor(private prisma: PrismaService) {}

  async createMessage(newMessage: Message, roomName: string) {
    const rep = await this.prisma.message.create({
      data: {
        user: {
          connect: {
            id: newMessage?.user?.id,
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

    return rep;
  }

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
    console.log(privateMessage);
    console.log(room);

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

  async getAllMessagesByRoomName(roomName: string) {
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
