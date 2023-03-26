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
import { getIdFromToken, isAuthEmpty } from '../gatewayUtils/gatewayUtils';
import { GetUser } from '../auth/decorator';

@WebSocketGateway({
	namespace: '/user',
	cors: {
		origin: 'http://localhost:3333',
		credentials: true,
	},
})
export class UserGateway
	implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private userService: UserService) { }

	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket) {
		console.log("new connection")
		if (isAuthEmpty(client))
			return ;
		const userId = getIdFromToken(client.handshake.auth.token);
		this.userService.setUserOnLineOffline(userId, "ONLINE");
		this.server.emit('CHANGE_STATUS', {status: 'ONLINE', id: userId});
	}

	@SubscribeMessage('IN_GAME')
	handleInGame(@GetUser() token: string)
	{
		const userId = getIdFromToken(token);
		this.userService.setUserOnLineOffline(userId, "IN_GAME");
		this.server.emit('CHANGE_STATUS', {status: 'IN_GAME', id: userId});
	}

	@SubscribeMessage('ONLINE')
	handleOnline(@GetUser() token: string)
	{
		const userId = getIdFromToken(token);
		this.userService.setUserOnLineOffline(userId, "ONLINE");
		this.server.emit('CHANGE_STATUS', {status: 'ONLINE', id: userId});
	}

	@SubscribeMessage('OFFLINE')
	handleOffline(@GetUser() token: string)
	{
		const userId = getIdFromToken(token);
	}

	handleDisconnect(client: Socket) {
		if (isAuthEmpty(client))
			return ;
		const userId = getIdFromToken(client.handshake.auth.token);
		this.userService.setUserOnLineOffline(userId, "OFFLINE");
		this.server.emit('CHANGE_STATUS', {status: 'OFFLINE', id: userId});
	}
}
