import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from './user.service';
import { getIdFromToken, isAuthEmpty, getIdIfValid } from '../gatewayUtils/gatewayUtils';
import { GetUser } from '../auth/decorator';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
	namespace: '/user',
	cors: {
		origin: 'http://localhost:3333',
		credentials: true,
	},
})
export class UserGateway
	implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private userService: UserService,
			   private readonly config: ConfigService) { }
	

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket) {
	  const id = await getIdIfValid(client, this.config.get('JWT_SECRET'), this.userService);
	  if (!id)
	  {
		  client.disconnect();
		  return ;
	  }
		this.userService.setUserOnLineOffline(id, "ONLINE");
		this.userService.emitStatusToFriends(id, 'ONLINE');
		this.userService.addUserToConnected(client);
	}

	@SubscribeMessage('IN_GAME')
	handleInGame(@GetUser() token: string | undefined)
	{
		if (token === undefined)
			return ;
		const userId = getIdFromToken(token);
		this.userService.setUserOnLineOffline(userId, "IN_GAME");
		this.server.emit('CHANGE_STATUS', {status: 'IN_GAME', id: userId});
		this.userService.emitStatusToFriends(userId, 'IN_GAME');
	}

	@SubscribeMessage('ONLINE')
	handleOnline(@GetUser() token: string | undefined)
	{
		if (token === undefined)
			return ;
		const userId = getIdFromToken(token);
		this.userService.setUserOnLineOffline(userId, "ONLINE");
		this.userService.emitStatusToFriends(userId, 'ONLINE');
	}

	@SubscribeMessage('OFFLINE')
	handleOffline(@GetUser() token: string | undefined)
	{
		if (token === undefined)
			return ;
		const userId = getIdFromToken(token);
		this.userService.setUserOnLineOffline(userId, "OFFLINE");
		this.userService.emitStatusToFriends(userId, 'OFFLINE');
	}

	handleDisconnect(client: Socket) {
		if (isAuthEmpty(client))
			return ;
		const userId = getIdFromToken(client.handshake.auth.token);
		if (!this.userService.isUserInAnotherSession(userId))
		{
			this.userService.setUserOnLineOffline(userId, "OFFLINE");
			this.userService.emitStatusToFriends(userId, 'OFFLINE');
		}
		this.userService.removeUserFromConnected(client);
	}
}
