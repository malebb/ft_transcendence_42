import { SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		MessageBody,
		OnGatewayConnection,
		OnGatewayDisconnect,
		} from '@nestjs/websockets';

import { PongService } from './pong.service'

import { Socket,
		Server
		} from "socket.io"

import { Player } from "ft_transcendence"

@WebSocketGateway({
	cors: {
		origin: 'http://localhost:3333',
	}
})

export class GatewayPong implements OnGatewayConnection, OnGatewayDisconnect
{

	constructor(private readonly pongService : PongService) {}

	@WebSocketServer()
	server: Server;

	handleConnection(player: Socket)
	{
		console.log('Player ' + player.id + ' joined');
		this.pongService.findRoom(this.server, player, JSON.parse(String(player.handshake.query.playerData)));
	}

	handleDisconnect(player: Socket)
	{
		console.log('Player ' + player.id + " left");
		this.pongService.removeFromQueue(player.id);
	}

	@SubscribeMessage('joinRoom')
	joinRoom(player : Socket, roomId : string)
	{
		this.pongService.joinRoom(player, roomId);
    }

	@SubscribeMessage('movePlayer')
	movePlayer(@MessageBody() data : any) {
		let playerMoved : Player = this.pongService.movePlayer(data.roomId, data.position, data.key);

		this.server.to(data.roomId).emit('movePlayer', JSON.stringify({player: playerMoved, position: data.position}));
  	}

	@SubscribeMessage('speedPowerUp')
	speedPowerUp(@MessageBody() data : any) {
		this.pongService.useSpeedPowerUp(data.roomId, data.position, this.server);
  	}
}
