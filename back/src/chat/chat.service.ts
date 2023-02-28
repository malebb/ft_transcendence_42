// fichier pour la logique du module
// update, creation et rangements des donnees

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { UserService } from "src/user/user.service";
import { UserService } from '../user/user.service';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Chat } from './chat.entity';
import { User } from '@prisma/client';

// interfaces :
import { ChatRoom } from './models/ChatRoom';

// permet au client de communiquer au server par le biais
// de n'import quelle url
@Injectable()
export class ChatService {
  // constructor(
  // 	@InjectRepository(Chat) private chatRepository: Repository<Chat>,) {}

  // async createMessage(chat: Chat) {
  // return await this.chatRepository.save(chat);
  // }
	createRoom(client: Socket, room: ChatRoom)
	{

	}

  joinRoom(client: Socket, room: ChatRoom) {
    console.log({ room });
    client.on('SEND_ROOM_MESAGE', (message) => {
      console.log({ message });

    //   io.emit('ROOM_MESSAGE', message);
	});
    // console.log("funciton joinRoom in ChatService");
  }

  // async getMessages(): Promise<Chat[]> {
  // return await this.chatRepository.find();
  // }
}
