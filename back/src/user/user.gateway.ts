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
import { UseGuards } from '@nestjs/common';
import { WsGuard } from '../auth/guard/ws.guard';
import { Activity } from '@prisma/client';
import { Friend } from './types/friend.type';
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
	
	clients: Socket[] = [];

	@WebSocketServer()
	server: Server;

	async emitStatusToFriends(clientId: number, newStatus: Activity)
	{
		const friends: Friend[] = await this.userService.getFriends(clientId);
		for (let i = 0; i < this.clients.length; ++i)
		{
			for (let j = 0; j < friends.length; ++j)
			{
				if (friends[j].id === getIdFromToken(this.clients[i].handshake.auth.token))
				{
					this.clients[i].emit('CHANGE_STATUS', {status: newStatus, id: clientId});
					break ;
				}
			}
			if (clientId  === getIdFromToken(this.clients[i].handshake.auth.token))
				this.clients[i].emit('CHANGE_STATUS', {status: newStatus, id: clientId});
		}
	}

	async handleConnection(client: Socket) {
	  const id = await getIdIfValid(client, this.config.get('JWT_SECRET'), this.userService);
	  if (!id)
	  {
		  client.disconnect();
		  return ;
	  }
		this.userService.setUserOnLineOffline(id, "ONLINE");
		this.emitStatusToFriends(id, 'ONLINE');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('IN_GAME')
	handleInGame(@GetUser() token: string)
	{
		const userId = getIdFromToken(token);
		this.userService.setUserOnLineOffline(userId, "IN_GAME");
		this.server.emit('CHANGE_STATUS', {status: 'IN_GAME', id: userId});
		this.emitStatusToFriends(userId, 'IN_GAME');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('ONLINE')
	handleOnline(@GetUser() token: string)
	{
		const userId = getIdFromToken(token);
		this.userService.setUserOnLineOffline(userId, "ONLINE");
		this.emitStatusToFriends(userId, 'ONLINE');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('OFFLINE')
	handleOffline(@GetUser() token: string)
	{
		const userId = getIdFromToken(token);
		this.userService.setUserOnLineOffline(userId, "OFFLINE");
		this.emitStatusToFriends(userId, 'OFFLINE');
	}

	handleDisconnect(client: Socket) {
		if (isAuthEmpty(client))
			return ;
		const userId = getIdFromToken(client.handshake.auth.token);
		this.userService.setUserOnLineOffline(userId, "OFFLINE");
		this.emitStatusToFriends(userId, 'OFFLINE');
		for (let i = 0; i < this.clients.length; ++i)
		{
			if (this.clients[i].id === client.id)
			{
				this.clients.splice(i, 1);
				break ;
			}
		}
	}
}
