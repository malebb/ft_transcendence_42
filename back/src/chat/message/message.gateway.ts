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
import { MessageService } from './message.service';

// interfaces :
import { ChatRoom, Message } from 'ft_transcendence';
import { Logger } from '@nestjs/common';

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
  }

  @SubscribeMessage('JOIN_ROOM')
  joinRoom(client: Socket, room: ChatRoom) {
    client.join(String(room?.name));
  }

  @SubscribeMessage('SEND_ROOM_MESSAGE')
  receiveMessage(client: Socket, message: Message) {
    this.messageService.createMessage(message, message?.room?.name);
    client.to(message.room?.name).emit('ROOM_MESSAGE', message);
  }

  @SubscribeMessage('SEND_PRIVATE_ROOM_MESSAGE')
  async receivePrivateMessage(client: Socket, data) {
    await this.messageService.updatePrivateConv(data.room.id, data.msg, data.sender);
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
