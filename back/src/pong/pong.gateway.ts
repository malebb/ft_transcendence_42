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

import { Room } from "./pong.interface"

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
		let room : Room;

		console.log('Player ' + player.id + ' joined');
		this.pongService.addPlayer(player.id);
		room = this.pongService.checkQueue(player.id);
		if (room.id.length)
		{
			this.server.emit(room.opponentId, JSON.stringify({roomId : room.id, position : "left"}));
			this.server.emit(player.id, JSON.stringify({roomId : room.id, position: "right"}));
		}
	}

	handleDisconnect(client: Socket)
	{
		console.log('Player ' + client.id + " left");
		this.pongService.removePlayer(client.id);
	}

	@SubscribeMessage('joinRoom')
	joinRoom(player : Socket, roomId : string) {
		player.join(roomId);
    }
	
	@SubscribeMessage('moveBall')
	updateBall(@ConnectedSocket() player : Socket, @MessageBody() data : any) {
		this.server.to(data.roomId).emit('moveBall', JSON.stringify(data.ball));
    }

	@SubscribeMessage('movePlayer')
	movePlayer(@ConnectedSocket() player : Socket, @MessageBody() data : any) {
		player.to(data.roomId).emit('moveOpponent', JSON.stringify(data.player));
  	}

	@SubscribeMessage('updateScore')
	updateScore(@ConnectedSocket() player : Socket, @MessageBody() data : any) {
		player.to(data.roomId).emit('updateScore', JSON.stringify({score : {currentPlayer : data.score.opponent, opponent : data.score.currentPlayer}}));
  	}
}
