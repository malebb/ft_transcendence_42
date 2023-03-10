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

// import { AuthService } from '../auth/auth.service';
// import { UserService } from '../user/user.service';

@WebSocketGateway({
  namespace: '/chat',
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
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // va bind l'application MessageService
  constructor(
    private messageService: MessageService, // private authService: AuthService, // private userService: UserService
  ) {}

  // creation d'une instance server
  @WebSocketServer()
  server: Server;
  

  handleConnection(client: Socket) {
    console.log('Connected ' + client.id);
    // a faire
  }

  // ecoute les evenements venant du client/user (websocketgateway)
  // qui va donner acces a socket.io
  //   @SubscribeMessage('sendMessage')
  //   async handleSendMessage(user: Socket, payload: Chat) {
  //     await this.MessageService.createMessage(payload);
  //     this.server.emit('recMessage', payload);
  //   }

  //  @SubscribeMessage('CREATE_ROOM')
  //createRoom(client: Socket, room: ChatRoom) {
  //this.chatService.createRoom(client, room);
  //}
  // async??
  @SubscribeMessage('JOIN_ROOM')
  joinRoom(client: Socket, room: ChatRoom, @MessageBody() msg: any, @ConnectedSocket() currentsocket: Socket) {
    // enregistrer la socket dans un channel
    client.join(room.name);
    // console.log(JSON.stringify(this.server.in(room.name).fetchSockets()));
    client.on('SEND_ROOM_MESSAGE', (message: Message) => {
      this.messageService.createMessage(message, message.room.name);
      client.in(room.name).emit('ROOM_MESSAGE', message);
    });

  }

  afterInit(server: Server) {
    // console.log(server);
    // a faire
  }

  // @SubscribeMessage('all-messages')
  // getAllMessages(room: ChatRoom) {
  //   this.messageService.getAllMessagesByRoomName(room.name);
  // }

  @SubscribeMessage('disconnected')
  handleDisconnect(client: Socket) {
    // client.on('disconnected', () => {
      client.disconnect();
      console.log('Disconnected ' + client.id);
    // });
    // a faire
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
