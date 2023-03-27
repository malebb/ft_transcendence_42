import { SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		MessageBody,
		OnGatewayConnection,
		OnGatewayDisconnect,
		ConnectedSocket,
		} from '@nestjs/websockets';
import { GetUser } from '../auth/decorator';
import { PongService } from './pong.service'
import { Socket,
		Server
		} from "socket.io"
import { Player } from "ft_transcendence"
import { WsException } from '@nestjs/websockets';
import jwt_decode from "jwt-decode";
import { verify }  from 'jsonwebtoken';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from '../auth/guard/ws.guard';
import { ConfigService } from '@nestjs/config';

type JwtDecoded = 
{
	sub: number
}

interface PlayerConnected
{
	userId: number;
	socketId: string;
}

@WebSocketGateway({
	namespace: '/pong',
	cors: {
		origin: 'http://localhost:3333',
	}
})
export class GatewayPong implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor(private readonly pongService : PongService,
			   private readonly config: ConfigService) {}

	playersConnected: PlayerConnected[] = [];

	@WebSocketServer()
	server: Server;

	isUserIdConnected(userId: number)
	{
		for (let i = 0; i < this.playersConnected.length; ++i)
		{
			if (this.playersConnected[i].userId === userId)
				return (true);
		}
		return (false);
	}

	checkCredentialsOnConnection(player: Socket)
	{
		if (!Object.keys(player.handshake.auth).length)
			player.emit('error', new WsException('Invalid credentials'));
		else if (player.handshake.auth.token === undefined)
			player.emit('error', new WsException('Invalid credentials'));
		else
		{
			try
			{
				verify(player.handshake.auth.token, this.config.get('JWT_SECRET'));
				const decoded: JwtDecoded = jwt_decode(player.handshake.auth.token)
				const id = decoded.sub;
				if (this.isUserIdConnected(id))
					player.emit('error', new WsException('Already connected'));
				else
				{
					if (player.handshake.query.spectator === 'false')
						this.playersConnected.push({userId: id, socketId: player.id});
					return (id);
				}
			}
			catch (error: any)
			{
				console.log('error: ', error);
				player.emit('error', new WsException('Invalid credentials'));
			}
		}
		return (0);
	}

	handleConnection(player: Socket)
	{
		const id = this.checkCredentialsOnConnection(player);
		if (!id)
			return ;
		if (player.handshake.query.challenge === 'true')
			this.pongService.challenge(this.server, player, JSON.parse(String(player.handshake.query.challengeId)),
				JSON.parse(String(player.handshake.query.playerData)));
		else if (player.handshake.query.spectator === 'false')
			this.pongService.findRoom(this.server, player, JSON.parse(String(player.handshake.query.playerData)));
		else
			this.pongService.spectateRoom(String(player.handshake.query.roomId), player, id);
	}

	getIndexWithSocketId(socketId: string)
	{
		for (let i = 0; i < this.playersConnected.length; ++i)
		{
			if (this.playersConnected[i].socketId === socketId)
				return (i);
		}
		return (-1);
	}

	handleDisconnect(player: Socket)
	{
		this.pongService.removeFromQueue(player.id);
		const playerIndex = this.getIndexWithSocketId(player.id);
		if (playerIndex !== -1)
			this.playersConnected.splice(playerIndex, 1);
	}

	isUserIdConnectedWithSocketId(userId: number, socketId: string)
	{
		for (let i = 0; i < this.playersConnected.length; ++i)
		{
			if (this.playersConnected[i].userId === userId && this.playersConnected[i].socketId === socketId)
				return (true);
		}
		return (false);
	}

	checkCredentialsOnEvent(player: Socket, token: string)
	{
		if (token === undefined)
			player.emit('error', new WsException('Invalid credentials'));
		try
		{
			const jwtDecoded: JwtDecoded = jwt_decode(token);
			const id: number = jwtDecoded.sub;
			if (!this.isUserIdConnectedWithSocketId(id, player.id))
			{
				player.emit('error', new WsException('Already connected'));
				return (0);
			}
			return (id);
		}
		catch (error: any)
		{
			player.emit('error', new WsException('Invalid credentials'));
		}
		return (0);
	}


	@UseGuards(WsGuard)
	@SubscribeMessage('joinRoom')
	joinRoom(@ConnectedSocket() player : Socket, @MessageBody() data: any, @GetUser() token: string)
	{
		const playerId: number = this.checkCredentialsOnEvent(player, token);
		if (!playerId)
			return ;
		this.pongService.joinRoom(player, data.roomId, playerId, false);
    }

	@UseGuards(WsGuard)
	@SubscribeMessage('movePlayer')
	movePlayer(@ConnectedSocket() player: Socket, @MessageBody() data : any, @GetUser() token: string)
	{
		const playerId: number = this.checkCredentialsOnEvent(player, token);
		if (!playerId)
			return ;
		let playerMoved : Player = this.pongService.movePlayer(data.roomId, data.position, data.key, playerId);
		if (playerMoved)
			this.server.to(data.roomId).emit('movePlayer', JSON.stringify({player: playerMoved, position: data.position}));
  	}

	@UseGuards(WsGuard)
	@SubscribeMessage('speedPowerUp')
	speedPowerUp(@ConnectedSocket() player: Socket, @MessageBody() data : any, @GetUser() token: string)
	{
		const playerId: number = this.checkCredentialsOnEvent(player, token);
		if (!playerId)
			return ;
		this.pongService.useSpeedPowerUp(data.roomId, data.position, this.server, playerId);
  	}
}
