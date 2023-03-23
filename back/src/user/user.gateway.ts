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
		if (isAuthEmpty(client))
			return ;
		const userId = getIdFromToken(client.handshake.auth.token);
		this.userService.setUserOnLineOffline(userId, "ONLINE");
		this.server.emit('CHANGE_STATUS', {status: 'ONLINE', id: userId});
	}

	handleDisconnect(client: Socket) {
		if (isAuthEmpty(client))
			return ;
		const userId = getIdFromToken(client.handshake.auth.token);
		this.userService.setUserOnLineOffline(userId, "OFFLINE");
		this.server.emit('CHANGE_STATUS', {status: 'OFFLINE', id: userId});
	}
}
