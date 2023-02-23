import { Injectable } from '@nestjs/common'
import { Ball, Player, Size, Room, PlayerData } from 'ft_transcendence';
import { Socket, Server } from 'socket.io'
import { GameService } from '../game/game.service';
import { StatsService } from '../stats/stats.service';
import { levels } from './levels'

@Injectable()
export class PongService {

	constructor(private readonly gameService: GameService,
			   	private readonly statsService: StatsService) {}

	queue: PlayerData[] = [];
	powerUpQueue: PlayerData[] = [];
	rooms = [];
	sizeCanvas: Size = { width: 600, height: 350 };
	scoreToWin: number = 1;

	addToQueue(player: PlayerData, queue: PlayerData[]) {
		queue.push(player);
	}

	removeFromQueue(playerId: string) {
		for (let i = 0; i < this.queue.length; ++i) {
			if (this.queue[i].id == playerId)
				this.queue.splice(i, 1);
		}
		for (let i = 0; i < this.powerUpQueue.length; ++i) {
			if (this.powerUpQueue[i].id == playerId)
				this.powerUpQueue.splice(i, 1);
		}
	}

	spectateRoom(roomId: string, spectator: Socket)
	{
		if (roomId in this.rooms)
		{
			this.joinRoom(spectator, roomId);
			spectator.emit(spectator.id, JSON.stringify({joined: true, leftPlayer: this.rooms[roomId].leftPlayer, rightPlayer: this.rooms[roomId].rightPlayer, ball: this.rooms[roomId].ball}));
		}
		else
			spectator.emit(spectator.id, JSON.stringify({joined: false}));
	}

	checkQueue(player: PlayerData, queue: PlayerData[])
	{
		let roomId: string = "";
		let opponent: PlayerData;

		for (let i = 0; i < queue.length; ++i) {
			if (queue[i] === player)
				continue;
			roomId = queue[i].id < player.id ? queue[i].id + player.id : player.id + queue[i].id;
			opponent = queue[i];
			this.removeFromQueue(player.id);
			this.removeFromQueue(opponent.id);
		}
		return ({ roomId: roomId, opponent: opponent });
	}

	initRoom(roomId: string, leftPlayer: PlayerData, rightPlayer: PlayerData): Room {
		this.gameService.addGame(roomId, leftPlayer.username, rightPlayer.username);
		return (
			{
				id: roomId,
				playerGoneCount: 0,
				ball: new Ball(this.sizeCanvas.width / 2,
					this.sizeCanvas.height / 2,
					7,
					"white",
					6,
					null,
					this.sizeCanvas),

				leftPlayer: new Player(this.sizeCanvas.width / 30,
					this.sizeCanvas.height / 23,
					this.sizeCanvas.width / 60,
					this.sizeCanvas.height / 6,
					5,
					leftPlayer.skin,
					"left",
					leftPlayer.username,
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
					rightPlayer.username,
					null,
					this.sizeCanvas),
				speedPowerUpInterval: null,
				roomInterval: null,
				powerUpMode: leftPlayer.powerUpMode
			}
		);
	}

	findRoom(server: Server, player: Socket, playerData: PlayerData) {
		let room: Room;
		let queueResearch = { roomId: null, opponent: null };
		let queue: PlayerData[] = playerData.powerUpMode ? this.powerUpQueue : this.queue;

		playerData.id = player.id;
		this.addToQueue(playerData, queue);
		queueResearch = this.checkQueue(playerData, queue);
		if (queueResearch.roomId.length) {
			room = this.initRoom(queueResearch.roomId, queueResearch.opponent, playerData);
			this.rooms[room.id] = room;
			server.emit(queueResearch.opponent.id, JSON.stringify({ room: room, position: "left" }));
			server.emit(player.id, JSON.stringify({ room: room, position: "right" }));
			this.runRoom(room.id, server);
		}
		player.on("disconnecting", () => {
			this.stopRoom(player);
		});
	}

	stopRoom(player: Socket) {
		let roomToLeave: string | undefined;

		roomToLeave = Array.from(player.rooms)[1];
		if (roomToLeave != undefined) {
			if (this.rooms[roomToLeave].playerGoneCount == 1)
				this.rooms[roomToLeave].playerGoneCount++;
			else
			{
				this.gameService.removeGame(roomToLeave);
				player.to(roomToLeave).emit("opponentDisconnection");
				this.rooms[roomToLeave].playerGoneCount++;
			}
		}
	}

	movePlayer(roomId: string, position: string, key: string): Player {
		if (position == "left") {
			this.rooms[roomId].leftPlayer.move(key);
			return (this.rooms[roomId].leftPlayer);
		}
		else {
			this.rooms[roomId].rightPlayer.move(key);
			return (this.rooms[roomId].rightPlayer);
		}
	}

	joinRoom(player: Socket, roomId: string) {
		player.join(roomId);
	}

	async updateStats(winnerUsername: string, loserUsername: string)
	{
		this.statsService.addVictory(winnerUsername);
		this.statsService.addDefeat(loserUsername);

		await this.statsService.addXp(winnerUsername, 500);

		let winnerXp = (await this.statsService.getXp(winnerUsername));
		let newLevel = 0;

		for (let i = 0; i < levels.length; ++i)
		{
			if (levels[i] <= winnerXp)
				newLevel++;
		}

		let winnerLevel = (await this.statsService.getLevel(winnerUsername));
		if (newLevel != winnerLevel)
			await this.statsService.updateLevel(winnerUsername, newLevel);
	}

	runRoom(roomId: string, server: Server) {
		let scorer: string = "";

		if (this.rooms[roomId].powerUpMode) {
			this.rooms[roomId].speedPowerUpInterval = setTimeout(() => {
				server.to(roomId).emit('updateSpeedPowerUp', true, "left");
				server.to(roomId).emit('updateSpeedPowerUp', true, "right");
			}, 10000);
		}

		this.rooms[roomId].roomInterval = setInterval(() =>
		{
			if (this.rooms[roomId].playerGoneCount == 2) {
				clearInterval(this.rooms[roomId].roomInterval);
				clearInterval(this.rooms[roomId].speedPowerUpInterval);
				delete this.rooms[roomId];
			}
			else
			{
				if ((scorer = this.rooms[roomId].ball.move([this.rooms[roomId].leftPlayer, this.rooms[roomId].rightPlayer])).length)
				{
					if (scorer == "left")
					{
						server.to(roomId).emit('updateScore', JSON.stringify({ scorer: scorer, score: this.rooms[roomId].leftPlayer.score }));
						if (this.rooms[roomId].leftPlayer.score == this.scoreToWin)
						{
							this.updateStats(this.rooms[roomId].leftPlayer.username, this.rooms[roomId].rightPlayer.username);
							server.to(roomId).emit('endGame', scorer);
						}
					}
					else if (scorer == "right")
					{
						server.to(roomId).emit('updateScore', JSON.stringify({ scorer: scorer, score: this.rooms[roomId].rightPlayer.score }));
						if (this.rooms[roomId].rightPlayer.score == this.scoreToWin)
						{
							this.updateStats(this.rooms[roomId].rightPlayer.username, this.rooms[roomId].leftPlayer.username);
							server.to(roomId).emit('endGame', scorer);
						}
					}
					scorer = "";
				}
				server.to(roomId).emit('moveBall', JSON.stringify(this.rooms[roomId].ball));
			}
		}, 20);
	}

	useSpeedPowerUp(roomId: string, position: string, server: Server) {
		this.rooms[roomId].speedPowerUpInterval = setTimeout(() => {
			server.to(roomId).emit('updateSpeedPowerUp', true, position);
			server.to(roomId).emit('updateSpeedPowerUp', true, position);
		}, 10000);

		this.rooms[roomId].ball.speedPowerUp();
		server.to(roomId).emit('updateSpeedPowerUp', false, position);
	}
}
