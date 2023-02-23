import { Injectable } from '@nestjs/common';
import { Ball, Player, Size, Room, PlayerData } from 'ft_transcendence';
import { Socket, Server } from 'socket.io';
import { GameService } from '../game/game.service';
import { StatsService } from '../stats/stats.service';
import { HistoryService } from '../history/history.service';
import { UserService } from '../user/user.service';
import { levels } from './levels';
import { winSteps, levelSteps, modeExplorer,
		fashionWeek, traveler, failureKnowledge} from './achievements';
import { Stats } from './Stats';
import { Customisation } from './Customisation';

@Injectable()
export class PongService {

	constructor(private readonly gameService: GameService,
			   	private readonly statsService: StatsService,
			   	private readonly historyService: HistoryService,
			   	private readonly userService: UserService) {}

	queue: PlayerData[] = [];
	powerUpQueue: PlayerData[] = [];
	rooms = [];
	sizeCanvas: Size = { width: 600, height: 350 };
	scoreToWin: number = 11;

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

	async updateAchievements(player: Player, playerStats: Stats,
							 levelUp: boolean, powerUpMode: boolean, winner: boolean)
	{
		let playerCustomisation: Customisation = await this.userService.getCustomisation(player.username);

		if (winner)
		{
			for (let i = 0; i < winSteps.length; ++i)
			{
				if (playerStats.victory == winSteps[i].gameWon)
				{
					await this.historyService.addAchievementDone(player.username, winSteps[i].title, winSteps[i].desc);
					break;
				}
			}
		}
		if (winner && levelUp)
		{
			for (let i = 0; i < levelSteps.length; ++i)
			{
				if (playerStats.level == levelSteps[i].level)
				{
					await this.historyService.addAchievementDone(player.username, levelSteps[i].title, levelSteps[i].desc);
					break;
				}
			}
		}
		if (powerUpMode && !playerStats.modeExplorer)
		{
			await this.historyService.addAchievementDone(player.username, modeExplorer.title, modeExplorer.desc);
			await this.statsService.updateModeExplorer(player.username);
		}
		if (playerCustomisation.skin != "white" && !playerStats.fashionWeek)
		{
			await this.historyService.addAchievementDone(player.username, fashionWeek.title, fashionWeek.desc);
			await this.statsService.updateFashionWeek(player.username);
		}
		if (playerCustomisation.map != "basic" && !playerStats.traveler)
		{
			await this.historyService.addAchievementDone(player.username, traveler.title, traveler.desc);
			await this.statsService.updateTraveler(player.username);
		}
		if (!winner && playerStats.defeat == failureKnowledge.gameLost)
		{
			await this.historyService.addAchievementDone(player.username, failureKnowledge.title, failureKnowledge.desc);
			await this.statsService.updateFailureKnowledge(player.username);
		}

	}

	async updateStats(winner: Player, loser: Player, powerUpMode: boolean)
	{
		await this.statsService.addVictory(winner.username);
		await this.statsService.addDefeat(loser.username);
		await this.statsService.addXp(winner.username, 500);

		let winnerStats: Stats = await this.statsService.getStats(winner.username);
		let loserStats: Stats = await this.statsService.getStats(loser.username);

		let newWinnerLevel = 0;

		for (let i = 0; i < levels.length; ++i)
		{
			if (levels[i] <= winnerStats.xp)
				newWinnerLevel++;
		}
		let levelUp = false;
		if (newWinnerLevel != winnerStats.level)
		{
			await this.statsService.updateLevel(winner.username, newWinnerLevel);
			winnerStats.level = newWinnerLevel;
			levelUp = true;
		}
		this.updateAchievements(winner, winnerStats, levelUp, powerUpMode, true);
		this.updateAchievements(loser, loserStats, levelUp, powerUpMode, false);
	}

	async updateHistory(leftUsername: string, rightUsername: string, leftScore: number, rightScore: number)
	{
		this.historyService.addGamePlayed(leftUsername, rightUsername, leftScore, rightScore);
	}

	runRoom(roomId: string, server: Server) {
		let scorer: string = "";

		if (this.rooms[roomId].powerUpMode) {
			this.rooms[roomId].speedPowerUpInterval = setTimeout(() => {
				server.to(roomId).emit('updateSpeedPowerUp', true, "left");
				server.to(roomId).emit('updateSpeedPowerUp', true, "right");
				this.rooms[roomId].leftPlayer.speedPowerUp = true;
				this.rooms[roomId].rightPlayer.speedPowerUp = true;
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
							this.updateStats(this.rooms[roomId].leftPlayer, this.rooms[roomId].rightPlayer, this.rooms[roomId].powerUpMode);
							this.updateHistory(this.rooms[roomId].leftPlayer.username, this.rooms[roomId].rightPlayer.username,
											  this.rooms[roomId].leftPlayer.score, this.rooms[roomId].rightPlayer.score);
							server.to(roomId).emit('endGame', scorer);
						}
					}
					else if (scorer == "right")
					{
						server.to(roomId).emit('updateScore', JSON.stringify({ scorer: scorer, score: this.rooms[roomId].rightPlayer.score }));
						if (this.rooms[roomId].rightPlayer.score == this.scoreToWin)
						{
							this.updateStats(this.rooms[roomId].rightPlayer, this.rooms[roomId].leftPlayer, this.rooms[roomId].powerUpMode);
							this.updateHistory(this.rooms[roomId].leftPlayer.username, this.rooms[roomId].rightPlayer.username,
											  this.rooms[roomId].leftPlayer.score, this.rooms[roomId].rightPlayer.score);
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
			if (position == "left")
				this.rooms[roomId].leftPlayer.speedPowerUp = true;
			else
				this.rooms[roomId].rightPlayer.speedPowerUp = true;
		}, 10000);

		this.rooms[roomId].ball.speedPowerUp();
		server.to(roomId).emit('updateSpeedPowerUp', false, position);
		if (position == "left")
			this.rooms[roomId].leftPlayer.speedPowerUp = false;
		else
			this.rooms[roomId].rightPlayer.speedPowerUp = false;
	}
}
