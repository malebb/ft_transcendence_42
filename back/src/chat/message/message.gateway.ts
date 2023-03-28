import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GetUser } from '../../auth/decorator';

// les deux vont exposer les methodes
// necessaires pour les messages des utilisateurs
import { MessageService } from './message.service';
import { ChatRoomService } from '../chatRoom/chatRoom.service';
import { UserService } from '../../user/user.service';
// interfaces :
import { ChatRoom, Message } from 'ft_transcendence';
import { Logger, Body } from '@nestjs/common';
import { getIdFromToken } from '../../gatewayUtils/gatewayUtils';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from '../../auth/guard/ws.guard';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: 'http://localhost:3333',
    credentials: true,
  },
})
// les 3 instances implementees
// permettent de connaitre l'etat de l'application
// ou de faire des operations grace aux hooks
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // va bind l'application MessageService
  constructor(private messageService: MessageService,
			 private chatRoomService: ChatRoomService,
			 private userService: UserService) {}

  // creation d'une instance server
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const sockets = this.server.sockets;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('JOIN_ROOM')
  joinRoom(client: Socket, room: ChatRoom) {
    client.join(String(room?.name));
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('SEND_ROOM_MESSAGE')
  async sendMessage(@ConnectedSocket() client: Socket, @Body() message: Message, @GetUser('') token) {
	const id = getIdFromToken(token);
	try
	{
    	await this.messageService.createMessage(message, message?.room?.name, id);
    	this.server.to(message.room?.name).emit('ROOM_MESSAGE', message);
	}
	catch (error: any)
	{
		const mute = await this.chatRoomService.myMute(message!.room!.name, id);
		if (mute.penalties.length)
	   		client.emit('MUTE', mute);
	}
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('SEND_PRIVATE_ROOM_MESSAGE')
  async receivePrivateMessage(client: Socket, data)
  {
   await this.messageService.updatePrivateConv(data.room.id, data.msg.message, data.senderId, data.receiverId, data.msg.type, data.msg.challengeId);
   	const blocked = await this.userService.getBlocked(data.senderId, data.receiverId);
	if (!blocked.length)
	    client.to(data.room?.name).emit("RECEIVE_PRIVATE_ROOM_MESSAGE", data.msg);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('JOIN_PRIVATE_ROOM')
  async joinPrivateRoom(client: Socket, data) {
      const privateRoom = await this.messageService.createPrivateRoom(
        data.senderId,
        data.receiverId,
      );
    client.join(privateRoom.name);
    client.emit("GET_ROOM", privateRoom);
  }

  handleDisconnect(client: Socket) {
    const sockets = this.server.sockets;
  }
}

/**
//* INFO

Fichier principalement pour appller le MessageService
Avoir le moins d'etape possible dedans

OnGatewayInit = implemente la methode afterInit()
OnGatewayConnection = implemente la methode handleConnection()
OnGatewayDisconnect = implemente la methode handleDisconnect()

@WebSocketGateway => permettre au client/user de communiquer avec le server

@SubscribeMessage => permet d'ecouter des messages du client

*/
