import { SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		MessageBody}
from '@nestjs/websockets';

import { PongService } from './pong.service'

import { Socket, Server } from "socket.io"

import { Room } from "./pong.interface"

@WebSocketGateway({
	cors: {
		origin: 'http://localhost:3333',
	}
})

export class GatewayPong {

	constructor(private readonly pongService : PongService) {}

	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket)
	{
		let room : Room;

		console.log("New client ! id = " + client.id);
		this.pongService.addPlayer(client.id);
		room = this.pongService.checkQueue(client.id);
		if (room.id.length)
		{
			this.server.emit(room.opponentId, {roomId : room.id, player : "playerB"});
			this.server.emit(client.id, {roomId : room.id, player: "playerA"});
		}
	}

	handleDisConnect(client: Socket)
	{
		console.log("client left ! id = " + client.id);
	}

	@SubscribeMessage('joinRoom')
	handleMatchmaking(client: Socket, roomId : string) {
		client.join(roomId);
    }
	
	@SubscribeMessage('ball')
	handleBall(@MessageBody() data : any) {
		this.server.to(data.roomId).emit('ball', JSON.stringify(data.ball));
    }

	@SubscribeMessage('playerA')
	handlePlayerA(@MessageBody() data : any) {
		this.server.to(data.roomId).emit('playerA', JSON.stringify(data.playerA));
  	}

	@SubscribeMessage('playerB')
	handlePlayerB(@MessageBody() data : any) {
		this.server.to(data.roomId).emit('playerB', JSON.stringify(data.playerB));
  	}
}
