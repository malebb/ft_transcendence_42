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

@WebSocketGateway({
	namespace: '/pong',
	cors: {
		origin: 'http://localhost:3333',
	}
})
export class GatewayPong implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor(private readonly pongService : PongService) {}


	@WebSocketServer()
	server: Server;


	async handleConnection(player: Socket)
	{
		const id = await this.pongService.checkCredentialsOnConnection(player);
		if (!id || !this.pongService.isConnectionValid(player))
		{
			player.disconnect();
			return ;
		}
		if (player.handshake.query.challenge === 'true')
		{
			this.pongService.challenge(this.server, player, JSON.parse(String(player.handshake.query.challengeId)),
				JSON.parse(String(player.handshake.query.playerData)));
		}
		else if (player.handshake.query.spectator === 'false')
			this.pongService.findRoom(this.server, player, JSON.parse(String(player.handshake.query.playerData)));
		else
			this.pongService.spectateRoom(String(player.handshake.query.roomId), player, id);
	}

	handleDisconnect(player: Socket)
	{
		this.pongService.removeFromQueue(player.id);
		this.pongService.removeFromSocketConnected(player);
	}

	@SubscribeMessage('joinRoom')
	joinRoom(@ConnectedSocket() player : Socket, @MessageBody() data: any, @GetUser() token: string | undefined)
	{
		const playerId: number = this.pongService.checkCredentialsOnEvent(player, token);
		if (!playerId || !data.roomId)
			return ;
		this.pongService.joinRoom(player, data.roomId, playerId, false);
    }

	@SubscribeMessage('movePlayer')
	movePlayer(@ConnectedSocket() player: Socket, @MessageBody() data : any, @GetUser() token: string | undefined)
	{
		const playerId: number = this.pongService.checkCredentialsOnEvent(player, token);
		if (!playerId || !data.roomId || !data.position || !data.key)
			return ;
		let playerMoved : Player = this.pongService.movePlayer(data.roomId, data.position, data.key, playerId);
		if (playerMoved)
			this.server.to(data.roomId).emit('movePlayer', JSON.stringify({player: playerMoved, position: data.position}));
  	}

	@SubscribeMessage('speedPowerUp')
	speedPowerUp(@ConnectedSocket() player: Socket, @MessageBody() data : any, @GetUser() token: string | undefined)
	{
		const playerId: number = this.pongService.checkCredentialsOnEvent(player, token);
		if (!playerId || !data.roomId || !data.position)
			return ;
		this.pongService.useSpeedPowerUp(data.roomId, data.position, this.server, playerId);
  	}
}
