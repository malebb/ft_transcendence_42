// fichier pour la logique du module
// update, creation et rangements des donnees

import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { UserService } from "src/user/user.service";
import { UserService } from "../user/user.service";
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
import { User } from "@prisma/client";

// permet au client de communiquer au server par le biais
// de n'import quelle url
@Injectable() 
export class ChatService {
	// constructor(
	// 	@InjectRepository(Chat) private chatRepository: Repository<Chat>,) {}

	async createMessage(chat: Chat) {
		// return await this.chatRepository.save(chat);
	}

	// async getMessages(): Promise<Chat[]> {
		// return await this.chatRepository.find();
	// }
}

// @Injectable()
// export class ChatService {



// }