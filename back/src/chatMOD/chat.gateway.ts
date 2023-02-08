// import {
// 	SubscribeMessage,
// 	WebSocketGateway,
// 	OnGatewayInit,
// 	WebSocketServer,
// 	OnGatewayConnection,
// 	OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Socket, Server } from 'socket.io';
// import { Chat } from './chat.entity';
// import { ChatService } from './chat.service';
// import { AuthService } from '../auth/auth.service';
// import { UserService } from '../user/user.service';

// @WebSocketGateway({
// 	cors: {
// 		origin: '*',
// 	},
// })

// export class ChatGateway
// implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
// 	constructor(
// 		private chatService: ChatService,
// 		private authService: AuthService,
// 		private userService: UserService
// 	) {}
  
// 	@WebSocketServer()
// 	server: Server;
  
// 	@SubscribeMessage('sendMessage')
// 	async handleSendMessage(client: Socket, payload: Chat): Promise<void> {
// 		await this.chatService.createMessage(payload);
// 		this.server.emit('recMessage', payload);
// 	}
  
// 	afterInit(server: Server) {
// 		console.log(server);
// 		//Do stuffs
// 	}
  
// 	handleDisconnect(client: Socket) {
// 		console.log(`Disconnected: ${client.id}`);
// 		//Do stuffs
// 	}
  
// 	handleConnection(client: Socket, ...args: any[]) {
// 		console.log(`Connected ${client.id}`);
// 		//Do stuffs
// 	}
// }