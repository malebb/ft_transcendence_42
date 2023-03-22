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

  @SubscribeMessage('PRIVATE')
  async receivePrivateMessage(client: Socket, data) {
    // console.log(privateMessage);
    const privateMessage = await this.messageService.createPrivateMessage(
      privateRoom,
      data.msg,
      data.sender,
      data.receiver,
    );
    const privateRoom = await this.messageService.createPrivateRoom(
      data.sender,
      data.receiver,
      // privateMessage.id,
    );
    // const privateRoom = String(privateMessage.id)
    // client.join(privateRoom);
    console.log(42);
    console.log(privateRoom);
    console.log(42);
    // client.emit('PRIVATE_ROOM');

    // client.to(privateRoom).emit(data.receiver.id, data.msg)
    // client.to(privateRoom).emit('PRIVATE', data.msg);

    // client.to[data.friend!.id].emit('PRIVATE', {
    //   from: client.id,
    //   to: data.friend.to,
    //   msg: data.msg,
    // });
    // client.emit('PRIVATE', {
    //   from: client.id,
    //   to: data.friend.to,
    //   msg: data,
    // });
    // });
  }

  afterInit(server: Server) {
    // console.log(server);
    // a faire
  }

  // @SubscribeMessage('all-messages')
  // getAllMessages(room: ChatRoom) {
  //   this.messageService.getAllMessagesByRoomName(room.name);
  // }

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
