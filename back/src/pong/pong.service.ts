import { Injectable } from '@nestjs/common'
import { Ball, Player, Size, Room, PlayerData} from 'ft_transcendence';
import { Socket, Server } from 'socket.io'

@Injectable()
export class PongService
{
	queue : PlayerData[] = [];
	rooms = [];
	sizeCanvas : Size = {width : 600, height : 350};
	scoreToWin: number = 11;

	addToQueue(player : PlayerData)
	{
		this.queue.push(player);
	}

	removeFromQueue(playerId : string)
	{
		for (let i = 0; i < this.queue.length; ++i)
		{
			if (this.queue[i].id == playerId)
				this.queue.splice(i, 1);
		}
	}

	checkQueue(player : PlayerData)
	{
		let roomId: string =  "";
		let opponent: PlayerData;

		for (let i = 0; i < this.queue.length; ++i)
		{
			if (this.queue[i] === player)
				continue ;
			roomId = this.queue[i].id < player.id ? this.queue[i] + player.id : player.id + this.queue[i];
			opponent = this.queue[i];
			this.removeFromQueue(player.id);
			this.removeFromQueue(opponent.id);
		}
		return ({roomId : roomId, opponent : opponent});
	}

	initRoom(roomId: string, leftPlayer: PlayerData, rightPlayer: PlayerData) : Room
	{
		return (
			{
				id: roomId,
				running: false,
				ball:		new Ball(this.sizeCanvas.width / 2,
									this.sizeCanvas.height / 2,
									7,
							 		"white",
									6,
							  		null,
									this.sizeCanvas),

				leftPlayer:	new Player(this.sizeCanvas.width / 30,
									   this.sizeCanvas.height / 23,
									   this.sizeCanvas.width / 60, 
									   this.sizeCanvas.height / 6,
									   5,
									   leftPlayer.skin,
									   "left",
									   null,
									   this.sizeCanvas),

				rightPlayer: new Player(this.sizeCanvas.width - this.sizeCanvas.width / 30
									   - (this.sizeCanvas.width / 60),
									   this.sizeCanvas.height -
										(this.sizeCanvas.height / 23 + (this.sizeCanvas.height / 6)),
									   this.sizeCanvas.width / 60,
									   this.sizeCanvas.height / 6,
									   5,
									   rightPlayer.skin,
									   "right",
									   null,
									   this.sizeCanvas),
				speedPowerUpInterval: null
			}
		);
	}

	findRoom(server: Server, player: Socket, playerData: PlayerData)
	{
		let room: Room;
		let queueResearch = {roomId: null, opponent: null};

		playerData.id = player.id;
		this.addToQueue(playerData);
		queueResearch = this.checkQueue(playerData);
		if (queueResearch.roomId.length)
		{
			room = this.initRoom(queueResearch.roomId, queueResearch.opponent, playerData);
			this.rooms[room.id] = room;
			server.emit(queueResearch.opponent.id, JSON.stringify({room: room, position: "left"}));
			server.emit(player.id, JSON.stringify({room: room, position: "right"}));
			this.runRoom(room.id, server);
		}
	  	player.on("disconnecting", () => {
			this.stopRoom(player);
  		});
	}

	stopRoom(player: Socket)
	{
		let roomToLeave: string | undefined;

		roomToLeave = Array.from(player.rooms)[1];
		if (roomToLeave != undefined)
		{
			if (this.rooms[roomToLeave].running == false)
				this.rooms.splice(this.rooms.indexOf(roomToLeave), 1);
			else
			{
				this.rooms[roomToLeave].running = false;
				player.to(roomToLeave).emit("opponentDisconnection");
			}
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
		let roomInterval: ReturnType<typeof setInterval>;

		this.rooms[roomId].running = true;
		this.rooms[roomId].speedPowerUpInterval = setTimeout(() =>
		{
			server.to(roomId).emit('updateSpeedPowerUp', true, "left");
			server.to(roomId).emit('updateSpeedPowerUp', true, "right");
		}, 10000);

		roomInterval = setInterval(() =>
		{
			if (!this.rooms[roomId].running)
			{
				clearInterval(roomInterval);
				clearInterval(this.rooms[roomId].speedPowerUpInterval);
			}
			if ((scorer = this.rooms[roomId].ball.move([this.rooms[roomId].leftPlayer, this.rooms[roomId].rightPlayer])).length)
			{
				if (scorer == "left")
				{
					server.to(roomId).emit('updateScore', JSON.stringify({scorer: scorer, score: this.rooms[roomId].leftPlayer.score}));
					if (this.rooms[roomId].leftPlayer.score == this.scoreToWin)
						server.to(roomId).emit('endGame', scorer);
				}
				else if (scorer == "right")
				{
					server.to(roomId).emit('updateScore', JSON.stringify({scorer: scorer, score: this.rooms[roomId].rightPlayer.score}));
					if (this.rooms[roomId].rightPlayer.score == this.scoreToWin)
						server.to(roomId).emit('endGame', scorer);
				}
				scorer = "";
			}
			server.to(roomId).emit('moveBall', JSON.stringify(this.rooms[roomId].ball));
		}, 20);
	}

	useSpeedPowerUp(roomId: string, position: string, server: Server)
	{
		this.rooms[roomId].speedPowerUpInterval = setTimeout(() =>
		{
			server.to(roomId).emit('updateSpeedPowerUp', true, "left");
			server.to(roomId).emit('updateSpeedPowerUp', true, "right");
		}, 10000);

		this.rooms[roomId].ball.speedPowerUp();
		server.to(roomId).emit('updateSpeedPowerUp', false, position);
	}
}
