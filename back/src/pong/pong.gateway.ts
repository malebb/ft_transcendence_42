import { SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		MessageBody,
		OnGatewayConnection,
		OnGatewayDisconnect
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

	handleConnection(client: Socket)
	{
		let room : Room;

		console.log('Player ' + client.id + ' joined');
		this.pongService.addPlayer(client.id);
		room = this.pongService.checkQueue(client.id);
		if (room.id.length)
		{
			this.server.emit(room.opponentId, {roomId : room.id, player : "playerB"});
			this.server.emit(client.id, {roomId : room.id, player: "playerA"});
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

	@SubscribeMessage('playerA')
	updatePlayerA(@MessageBody() data : any) {
		this.server.to(data.roomId).emit('playerA', JSON.stringify(data.playerA));
  	}

	@SubscribeMessage('playerB')
	updatePlayerB(@MessageBody() data : any) {
		this.server.to(data.roomId).emit('playerB', JSON.stringify(data.playerB));
  	}

	@SubscribeMessage('updateScore')
	updateScore(@MessageBody() data : any) {
		this.server.to(data.roomId).emit('updateScore', JSON.stringify(data.score));
  	}
}
