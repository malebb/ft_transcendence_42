// fichier pour la logique du module
// update, creation et rangements des donnees

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatRoom } from 'ft_transcendence';
import { ChatRoomService } from './chatRoom/chatRoom.service';
// import { User } from '@prisma/client';

// interfaces :
// import { UserController } from 'src/user/user.controller';
// import { JwtService } from '@nestjs/jwt';

// permet au client de communiquer au server par le biais
// de n'import quelle url
@Injectable()
export class ChatService {
  constructor(
  	private readonly chatRoomService: ChatRoomService
  ){}
	// private userController: UserController,
	// private jwtService: JwtService,
	// private user: User,
	// private userController: UserController) {}
  	// @InjectRepository(Chat) private chatRepository: Repository<Chat>,) {}

  // async createMessage(chat: Chat) {
  // return await this.chatRepository.save(chat);
  // }
	createRoom(client: Socket, room: ChatRoom)
	{
		this.chatRoomService.createChatRoom(room);
	}

	joinRoom(server: Server, client: Socket, room: ChatRoom)
	{
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

  // async getMessages(): Promise<Chat[]> {
  // return await this.chatRepository.find();
  // }
}
