import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

// les deux vont exposer les methodes 
// necessaires pour les messages des utilisateurs
import { Chat } from './chat.entity';
import { ChatService } from './chat.service';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@WebSocketGateway({
	cors: {
		origin: '*',
		// eventuellement 'http://localhost:3333'
	},
})

// les 3 instances implementees
// permettent de connaitre l'etat de l'application
export class ChatGateway
implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private chatService: ChatService,
		private authService: AuthService,
		private userService: UserService
	) {}
  
	@WebSocketServer()
	server: Server;

	@SubscribeMessage('joinRoom')
	joinRoom(user: Socket, roomId: string)
	{
		console.log("User ${user.id} joined room ${roomId}");
	}

// ecoute les evenements venant du client/user (websocketgateway)
// qui va donner acces a socket.io
	@SubscribeMessage('sendMessage')
	async handleSendMessage(user: Socket, payload: Chat): Promise<void> {
		await this.chatService.createMessage(payload);
		this.server.emit('recMessage', payload);
	}

	afterInit(server: Server) {
		console.log(server);
		// a faire
	}
  
	handleDisconnect(user: Socket) {
		console.log(`Disconnected: ${user.id}`);
		// a faire
	}

	handleConnection(user: Socket, ...args: any[]) {
		console.log(`Connected ${user.id}`);
		// a faire
	}
}

/**
//* INFO

OnGatewayInit = implemente la methode afterInit()
OnGatewayConnection = implemente la methode handleConnection()
OnGatewayDisconnect = implemente la methode handleDisconnect()

@WebSocketGateway => // permettre au client/user de communiquer avec le server

@SubscribeMessage => 

*/