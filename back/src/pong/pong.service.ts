import { Injectable } from '@nestjs/common'
import { Ball, Player, Size, Room } from 'ft_transcendence';
import { Socket, Server } from 'socket.io'

@Injectable()
export class PongService
{
	queue : string[] = [];
	rooms = [];
	sizeCanvas : Size = {width : 600, height : 350};

	addPlayer(playerId : string)
	{
		this.queue.push(playerId);
	}

	removePlayer(playerId : string)
	{
		this.queue.splice(this.queue.indexOf(playerId), 1);
	}

	checkQueue(playerId : string)
	{
		let roomId: string =  "";
		let opponentId = "";

		for (let i = 0; i < this.queue.length; ++i)
		{
			if (this.queue[i] === playerId)
				continue ;
			roomId = this.queue[i] < playerId ? this.queue[i] + playerId : playerId + this.queue[i];
			opponentId = this.queue[i];
			this.queue.splice(this.queue.indexOf(playerId), 1);
			this.queue.splice(this.queue.indexOf(opponentId), 1);
		}
		return ({roomId : roomId, opponentId : opponentId});
	}

	initRoom(roomId: string) : Room
	{
		return (
			{
				id: roomId,
				ball: new Ball(this.sizeCanvas.width / 2,
							   this.sizeCanvas.height / 2, 10, "white", null, this.sizeCanvas),
				leftPlayer: new Player(75, 100, this.sizeCanvas.width / 60, this.sizeCanvas.height / 5, 4, "white", "left", null, this.sizeCanvas),
				rightPlayer: new Player(this.sizeCanvas.width - 100, this.sizeCanvas.height - 100, this.sizeCanvas.width / 60, this.sizeCanvas.height / 5, 4, "white", "right", null, this.sizeCanvas)
			}
		);
	}

	findRoom(server: Server, player: Socket)
	{
		let room : Room;
		let queueResearch = {roomId: null, opponentId: ""};

		this.addPlayer(player.id);
		queueResearch = this.checkQueue(player.id);
		if (queueResearch.roomId.length)
		{
			room = this.initRoom(queueResearch.roomId);
			this.rooms[room.id] = room;
			server.emit(queueResearch.opponentId, JSON.stringify({room: room, position: "left"}));
			server.emit(player.id, JSON.stringify({room: room, position: "right"}));
			this.runRoom(room.id, server);
		}
	}

	movePlayer(roomId: string, position: string, key:string) : Player
	{
		if (position == "left")
		{
			this.rooms[roomId].leftPlayer.move(key);
			return (this.rooms[roomId].leftPlayer);
		}
		else
		{
			this.rooms[roomId].rightPlayer.move(key);
				return (this.rooms[roomId].rightPlayer);
		}	
	}

	joinRoom(player: Socket, roomId: string)
	{
		player.join(roomId);
	}

	runRoom(roomId: string, server: Server)
	{
		let scorer: string = "";

		setInterval(() => {
			if ((scorer = this.rooms[roomId].ball.move([this.rooms[roomId].leftPlayer, this.rooms[roomId].rightPlayer])).length)
			{
				if (scorer == "left")
					server.to(roomId).emit('updateScore', JSON.stringify({scorer: scorer, score: this.rooms[roomId].leftPlayer.score}));
				else if (scorer == "right")
					server.to(roomId).emit('updateScore', JSON.stringify({scorer: scorer, score: this.rooms[roomId].rightPlayer.score}));
				scorer = "";
			}
			server.to(roomId).emit('moveBall', JSON.stringify(this.rooms[roomId].ball));
		}, 20);
	}
}
