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

// interfaces :
import { Room } from './models/room.interface';

// import { AuthService } from '../auth/auth.service';
// import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3333',
    // eventuellement 'http://localhost:3333'
    credentials: true,
    // methods: ['GET', 'POST']
  },
})
// les 3 instances implementees
// permettent de connaitre l'etat de l'application
// ou de faire des operations grace aux hooks
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // va bind l'application ChatService
  constructor(
    private chatService: ChatService,
  ) // private authService: AuthService,
  // private userService: UserService
  {}

  handleConnection(client: Socket) {
    console.log(`Connected ${client.id}`);
    // a faire
  }

  // creation d'une instance server
  @WebSocketServer()
  server: Server;

  // ecoute les evenements venant du client/user (websocketgateway)
  // qui va donner acces a socket.io
  @SubscribeMessage('sendMessage')
  async handleSendMessage(user: Socket, payload: Chat) {
    await this.chatService.createMessage(payload);
    this.server.emit('recMessage', payload);
  }

  // async??
  @SubscribeMessage('JOIN_ROOM')
  async joinRoom(client: Socket, room: Room) {
	this.chatService.joinRoom(client, room);
    console.log('User ' + client.id + ' joined room ' + room.roomId);
  }

  afterInit(server: Server) {
    console.log(server);
    // a faire
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
    // a faire
  }


}

/**
//* INFO

OnGatewayInit = implemente la methode afterInit()
OnGatewayConnection = implemente la methode handleConnection()
OnGatewayDisconnect = implemente la methode handleDisconnect()

@WebSocketGateway => permettre au client/user de communiquer avec le server

@SubscribeMessage => permet d'ecouter des messages du client

*/
