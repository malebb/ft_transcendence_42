import { SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		MessageBody,
		OnGatewayConnection,
		OnGatewayDisconnect,
		ConnectedSocket,
		} from '@nestjs/websockets';

import { Query } from '@nestjs/common'

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

	handleConnection(client: Socket)
	{
		let room : Room;

		console.log('Player ' + client.id + " arrived");
		this.pongService.addPlayer(client.id);
		room = this.pongService.checkQueue(client.id);
		if (room.id.length)
		{
			this.server.emit(room.opponentId, JSON.stringify({roomId : room.id, position : "left"}));
			this.server.emit(client.id, JSON.stringify({roomId : room.id, position: "right"}));
		}
	}

	handleDisconnect(client: Socket)
	{
		console.log('Player ' + client.id + " left");
		this.pongService.removePlayer(client.id);
	}

	@SubscribeMessage('joinRoom')
	joinRoom(client: Socket, roomId : string) {
		client.join(roomId);
    }
	
	@SubscribeMessage('ball')
	updateBall(@MessageBody() data : any) {
		this.server.to(data.roomId).emit('ball', JSON.stringify(data.ball));
    }

	@SubscribeMessage('movePlayer')
	movePlayer(@ConnectedSocket() client: Socket, @MessageBody() data : any) {
		client.to(data.roomId).emit('moveOpponent', JSON.stringify(data.currentPlayer));
  	}

	@SubscribeMessage('updateScore')
	updateScore(@ConnectedSocket() client : Socket, @MessageBody() data : any) {
		client.to(data.roomId).emit('updateScore', JSON.stringify({score : {opponent : data.score.currentPlayer, currentPlayer : data.score.opponent}}));
  	}
}
