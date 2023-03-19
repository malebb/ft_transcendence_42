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
  constructor(
    private messageService: MessageService, // private authService: AuthService, // private userService: UserService
  ) {}

  // creation d'une instance server
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const sockets = this.server.sockets;

    //console.log(`Message Socket client with id: ${client.id} connected.`);
    // this.logger.log(`Message Socket client with id: ${client.id} connected.`);
    // this.logger.debug(`Number of connected sockets: ${sockets.size}`);
  }


  // async??
  @SubscribeMessage('JOIN_ROOM')
  joinRoom(client: Socket, room: ChatRoom) {
    client.join(String(room?.name));
  }

  @SubscribeMessage('SEND_ROOM_MESSAGE')
  receiveMessage(client: Socket, message: Message) {
    this.messageService.createMessage(message, message?.room?.name);
    client.to(message.room?.name).emit('ROOM_MESSAGE', message);
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
    // this.logger.log(`Disconnected socket id: ${client.id} connected.`);
    // this.logger.debug(`Number of connected sockets: ${sockets.listeners}`);

    // TODO = enlever le client de la socket
    
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
