import { SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		MessageBody,
		OnGatewayConnection,
		OnGatewayDisconnect,
		ConnectedSocket
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
		this.pongService.findRoom(this.server, player);
	}

	handleDisconnect(client: Socket)
	{
		console.log('Player ' + client.id + " left");
		this.pongService.removePlayer(client.id);
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

	@SubscribeMessage('updateScore')
	updateScore(@ConnectedSocket() player : Socket, @MessageBody() data : any) {
		player.to(data.roomId).emit('updateScore', JSON.stringify({score : {currentPlayer : data.score.opponent, opponent : data.score.currentPlayer}}));
  	}
}
