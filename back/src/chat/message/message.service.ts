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
    // console.log("for " + roomName + " = " + rep);
  }

  async createPrivateMessage(
    room: ChatRoom,
    newMessage: Message,
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
    });

    return privateMessage;
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

  async createPrivateRoom(sender: User, receiver: User
    // , roomId: number
    ) {
    const privateRoom = await this.prisma.chatRoom.create({
      data: {
        owner: {
          connect: {
            id: sender.id,
          },
        },
        admins: {
          connect: {
            id: sender.id,
          },
        },
        members: {
          connect: {
            id: sender.id,
          },
        },
        name: String(roomId),
        password: '',
        accessibility: 'PUBLIC',
      },
    });
    const receiverJoinRoom = await this.prisma.user.update({
      where: {
        id: receiver.id,
      },
      data: {
        memberChats: {
          connect: {
            name: privateRoom.name,
          },
        },
      },
    });

    return privateRoom;
  }
}

/*
Prisma client est genere du prisma.schema

*/
