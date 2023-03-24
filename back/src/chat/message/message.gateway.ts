import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GetUser } from '../../auth/decorator';

// les deux vont exposer les methodes
// necessaires pour les messages des utilisateurs
import { MessageService } from './message.service';

// interfaces :
import { ChatRoom, Message } from 'ft_transcendence';
import { Logger, Body } from '@nestjs/common';
import jwt_decode from "jwt-decode";

type JwtDecoded = 
{
	sub: number
}

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
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessageGateway.name);

  // va bind l'application MessageService
  constructor(private messageService: MessageService) {}

  // creation d'une instance server
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const sockets = this.server.sockets;
    console.log(`Message Socket client with id: ${client.id} connected.`);

    //console.log(`Message Socket client with id: ${client.id} connected.`);
    // this.logger.log(`Message Socket client with id: ${client.id} connected.`);
    // this.logger.debug(`Number of connected sockets: ${sockets.size}`);
  }

  @SubscribeMessage('JOIN_ROOM')
  joinRoom(client: Socket, room: ChatRoom) {
    client.join(String(room?.name));
  }

	getIdFromToken(token: string)
	{
		const jwtDecoded: JwtDecoded = jwt_decode(token);
		const id: number = jwtDecoded.sub;
		return (id);
	}

  @SubscribeMessage('SEND_ROOM_MESSAGE')
  async receiveMessage(@ConnectedSocket() client: Socket, @Body() message: Message, @GetUser('') token) {
	try
	{
    	await this.messageService.createMessage(message, message?.room?.name, this.getIdFromToken(token));
    	client.to(message.room?.name).emit('ROOM_MESSAGE', message);
	}
	catch (error: any)
	{
    	client.emit('ERROR', 'Cannot send Message');
	}
  }

  @SubscribeMessage('SEND_PRIVATE_ROOM_MESSAGE')
  async receivePrivateMessage(client: Socket, data) {
    const newMessage = await this.messageService.updatePrivateConv(data.room.id, data.msg, data.sender);
    client.to(data.room?.name).emit("RECEIVE_PRIVATE_ROOM_MESSAGE", data.msg);
  }

  @SubscribeMessage('JOIN_PRIVATE_ROOM')
  async joinPrivateRoom(client: Socket, data) {
    let privateRoom = await this.messageService.checkIfPrivateConvExist(
      data.sender,
      data.receiver,
    );
    if (privateRoom === null) {
      privateRoom = await this.messageService.createPrivateRoom(
        data.sender,
        data.receiver,
      );
    }
    client.join(privateRoom.name);
    client.emit("GET_ROOM", privateRoom);
  }

  afterInit(server: Server) {}

  handleDisconnect(client: Socket) {
    const sockets = this.server.sockets;
    console.log(`Disconnected id: ${client.id}.`);
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
