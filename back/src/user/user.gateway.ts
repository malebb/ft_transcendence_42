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
import { UserService } from './user.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/user',
  cors: {
    origin: 'http://localhost:3333',
    credentials: true,
  },
})
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(UserGateway.name);

  constructor(private userService: UserService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // const sockets = this.server.sockets;
    // console.log(`Message Socket client with id: ${client.id} connected.`);
  }


  // In your backend code, you are logging the parameter userId as an object, which is the default behavior of the console.log() method when passed an object. To fix this, you can convert the userId parameter to a string or number using toString() or Number() respectively.
  @SubscribeMessage('USER_ONLINE')
  setUserOnLine(@MessageBody() data: any, client: Socket) {
    const userId = Number(data);
    this.userService.setUserOnLineOffline(userId, "ONLINE");
  }

  @SubscribeMessage('USER_OFFLINE')
  setUserOffline(@MessageBody() data: any, client: Socket) {
    const userId = Number(data);
    this.userService.setUserOnLineOffline(userId, "OFFLINE");
  }

  afterInit(server: Server) {}

  handleDisconnect(client: Socket) {
    console.log(`User deconected. SocketId: ${client.id}.`);
  }
}
