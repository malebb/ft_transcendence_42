import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Ball, Player, Size, Room, PlayerData } from 'ft_transcendence';
import { Socket, Server } from 'socket.io';
import { GameService } from '../game/game.service';
import { StatsService } from '../stats/stats.service';
import { HistoryService } from '../history/history.service';
import { UserService } from '../user/user.service';
import { ChallengeService } from '../challenge/challenge.service';
import { levels } from './levels';
import {
	winSteps, levelSteps, modeExplorer,
	fashionWeek, traveler, failureKnowledge
} from 'ft_transcendence';
import { Stats } from './Stats';
import { Customisation, Skins, Maps } from './Customisation';
import { PrismaService } from '../prisma/prisma.service';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { getIdIfValid } from '../gatewayUtils/gatewayUtils';
import jwt_decode from "jwt-decode";

interface Challenger {
	challengerId: string;
	challengeId: number;
	challenger: PlayerData;
}

type JwtDecoded = 
{
	sub: number
}

interface PlayerConnected
{
	userId: number;
	socketId: string;
}

@Injectable()
export class PongService {

	constructor(private readonly gameService: GameService,
		private readonly statsService: StatsService,
		private readonly historyService: HistoryService,
		private readonly userService: UserService,
		private readonly challengeService: ChallengeService,
		private readonly config: ConfigService,
		private readonly prisma: PrismaService) { }

	// gateways's checks : 
	playersConnected: PlayerConnected[] = [];

	// pong
	queue: PlayerData[] = [];
	powerUpQueue: PlayerData[] = [];
	challengers: Challenger[] = [];
	rooms = [];
	sizeCanvas: Size = { width: 700, height: 450 };
	scoreToWin: number = 11;

	addToQueue(player: PlayerData, queue: PlayerData[]) {
		queue.push(player);
	}

	async removeFromQueue(playerId: string) {
		for (let i = 0; i < this.queue.length; ++i) {
			if (this.queue[i].id == playerId)
				this.queue.splice(i, 1);
		}
		for (let i = 0; i < this.powerUpQueue.length; ++i) {
			if (this.powerUpQueue[i].id == playerId)
				this.powerUpQueue.splice(i, 1);
		}
		for (let i = 0; i < this.challengers.length; ++i) {
			if (this.challengers[i].challengerId == playerId) {
				try {
					await this.challengeService.deleteChallenge(this.challengers[i].challengeId, this.challengers[i].challenger.userId);
				}
				catch (error: any) {
				}
				this.challengers.splice(i, 1);
			}
		}
	}

	spectateRoom(roomId: string, spectator: Socket, userId: number)
	{
		if (roomId in this.rooms)
		{
			this.joinRoom(spectator, roomId, userId, true);
			spectator.emit(spectator.id, JSON.stringify({ joined: true, leftPlayer: this.rooms[roomId].leftPlayer, rightPlayer: this.rooms[roomId].rightPlayer, ball: this.rooms[roomId].ball }));
		}
		else
			spectator.emit(spectator.id, JSON.stringify({ joined: false }));
	}

	checkChallengers(challengeId: number, player: Socket) {
		let roomId: string = "";
		let opponent: PlayerData;

		for (let i = 0; i < this.challengers.length; ++i) {
			if (this.challengers[i].challengeId === challengeId) {
				roomId = this.challengers[i].challengerId < player.id ? this.challengers[i].challengerId + player.id : player.id + this.challengers[i].challengerId;
				opponent = this.challengers[i].challenger;
				this.removeFromQueue(player.id);
			}
		}
		return ({ roomId: roomId, opponent: opponent });
	}

	challenge(server: Server, player: Socket, challengeId: number, playerData: PlayerData) {
		let challenger: Challenger = { challengeId: challengeId, challengerId: player.id, challenger: playerData };
		let challengerResearch = { roomId: null, opponent: null };

		playerData.id = player.id;
		challengerResearch = this.checkChallengers(challengeId, player)
		if (challengerResearch.roomId.length) {
			let room: Room;
			room = this.initRoom(challengerResearch.roomId, challengerResearch.opponent, playerData);
			this.rooms[room.id] = room;
			server.emit(challengerResearch.opponent.id, JSON.stringify({ room: room, position: "left" }));
			server.emit(player.id, JSON.stringify({ room: room, position: "right" }));
			this.runRoom(room.id, server);
		}
		else
			this.challengers.push(challenger);
		player.on("disconnecting", () => {
			this.stopRoom(player, playerData);
		});
	}

	checkQueue(player: PlayerData, queue: PlayerData[]) {
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
		try {
			this.gameService.addGame(roomId, leftPlayer.userId, rightPlayer.userId);
		}
		catch (error: any) {
		}
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
					this.sizeCanvas.height / 7,
					5,
					leftPlayer.skin,
					"left",
					leftPlayer.username,
					leftPlayer.userId,
					null,
					this.sizeCanvas),

				rightPlayer: new Player(this.sizeCanvas.width - this.sizeCanvas.width / 30
					- (this.sizeCanvas.width / 60),
					this.sizeCanvas.height -
					(this.sizeCanvas.height / 23 + (this.sizeCanvas.height / 7)),
					this.sizeCanvas.width / 60,
					this.sizeCanvas.height / 7,
					5,
					rightPlayer.skin,
					"right",
					rightPlayer.username,
					rightPlayer.userId,
					null,
					this.sizeCanvas),
				leftPowerUpTimeout: null,
				rightPowerUpTimeout: null,
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
			this.stopRoom(player, playerData);
		});
	}

	stopRoom(player: Socket, playerData: PlayerData) {
		let roomToLeave: string | undefined;

		roomToLeave = Array.from(player.rooms)[1];
		if (roomToLeave != undefined) {
			if (this.rooms[roomToLeave].playerGoneCount == 1)
				this.rooms[roomToLeave].playerGoneCount++;
			else {
				try {
					this.gameService.removeGame(roomToLeave);
				}
				catch (error: any) {
				}
				player.to(roomToLeave).emit("opponentDisconnection");
				this.rooms[roomToLeave].playerGoneCount++;
				if (this.rooms[roomToLeave].leftPlayer.score !== this.scoreToWin
				   && this.rooms[roomToLeave].rightPlayer.score !== this.scoreToWin)
			   {
					if (this.rooms[roomToLeave].leftPlayer.id === playerData.userId)
					{
						this.updateStats(this.rooms[roomToLeave].rightPlayer,
							this.rooms[roomToLeave].leftPlayer,
							this.rooms[roomToLeave].powerUpMode);
					}
					else
					{
						this.updateStats(this.rooms[roomToLeave].leftPlayer,
							this.rooms[roomToLeave].rightPlayer,
							this.rooms[roomToLeave].powerUpMode);
					}
					this.updateHistory(this.rooms[roomToLeave].leftPlayer.id,
						this.rooms[roomToLeave].rightPlayer.id,
						this.rooms[roomToLeave].leftPlayer.score,
						this.rooms[roomToLeave].rightPlayer.score);
			   }
			}
		}
	}

	movePlayer(roomId: string, position: string, key: string, userId: number): Player | null {
		if (roomId in this.rooms) {
			if (position == "left" && this.rooms[roomId].leftPlayer.id === userId) {
				this.rooms[roomId].leftPlayer.move(key);
				return (this.rooms[roomId].leftPlayer);
			}
			else if (position === "right" && this.rooms[roomId].rightPlayer.id === userId) {
				this.rooms[roomId].rightPlayer.move(key);
				return (this.rooms[roomId].rightPlayer);
			}
		}
		return (null);
	}

	joinRoom(player: Socket, roomId: string, userId: number, spectator: boolean): boolean
	{
		if (roomId in this.rooms)
		{
			if (this.rooms[roomId].leftPlayer.id === userId ||
				this.rooms[roomId].rightPlayer.id === userId || spectator)
			{
				player.join(roomId);
				return (true);
			}
		}
		return (false);
	}

	async updateAchievements(player: Player, playerStats: Stats,
		levelUp: boolean, powerUpMode: boolean, winner: boolean) {
		let playerCustomisation: Customisation = await
			this.userService.getCustomisation(player.id);

		if (winner) {
			for (let i = 0; i < winSteps.length; ++i) {
				if (playerStats.victory == winSteps[i].goal) {
					await this.historyService.addAchievementDone(player.id,
						winSteps[i].title, winSteps[i].desc);
					break;
				}
			}
		}
		if (winner && levelUp) {
			for (let i = 0; i < levelSteps.length; ++i) {
				if (playerStats.level == levelSteps[i].goal) {
					await this.historyService.addAchievementDone(player.id,
						levelSteps[i].title, levelSteps[i].desc);
					break;
				}
			}
		}
		if (powerUpMode && !playerStats.modeExplorer) {
			await this.historyService.addAchievementDone(player.id,
				modeExplorer.title, modeExplorer.desc);
			await this.statsService.updateModeExplorer(player.id);
		}
		if (playerCustomisation.skin != "white" && !playerStats.fashionWeek) {
			await this.historyService.addAchievementDone(player.id,
				fashionWeek.title, fashionWeek.desc);
			await this.statsService.updateFashionWeek(player.id);
		}
		if (playerCustomisation.map != "basic" && !playerStats.traveler) {
			await this.historyService.addAchievementDone(player.id,
				traveler.title, traveler.desc);
			await this.statsService.updateTraveler(player.id);
		}
		if (!winner && playerStats.defeat == failureKnowledge.goal) {
			await this.historyService.addAchievementDone(player.id,
				failureKnowledge.title, failureKnowledge.desc);
			await this.statsService.updateFailureKnowledge(player.id);
		}
	}

	async updateStats(winner: Player, loser: Player, powerUpMode: boolean) {
		await this.statsService.addVictory(winner.id);
		await this.statsService.addDefeat(loser.id);
		await this.statsService.addXp(winner.id, 500);

		let winnerStats: Stats = await this.statsService.getStats(winner.id, winner.id);
		let loserStats: Stats = await this.statsService.getStats(loser.id, loser.id);

		let newWinnerLevel = 0;

		for (let i = 0; i < levels.length; ++i) {
			if (levels[i] <= winnerStats.xp)
				newWinnerLevel++;
		}
		let levelUp = false;
		if (newWinnerLevel != winnerStats.level) {
			await this.statsService.updateLevel(winner.id, newWinnerLevel);
			winnerStats.level = newWinnerLevel;
			levelUp = true;
		}
		this.updateAchievements(winner, winnerStats, levelUp, powerUpMode, true);
		this.updateAchievements(loser, loserStats, levelUp, powerUpMode, false);
	}

	async updateHistory(leftId: number, rightId: number,
		leftScore: number, rightScore: number) {
		await this.historyService.addGamePlayed(leftId,
			rightId, leftScore, rightScore);
	}

	runRoom(roomId: string, server: Server) {
		let scorer: string = "";

		if (this.rooms[roomId].powerUpMode) {
			this.programNextPowerUp(roomId, "left", server);
			this.programNextPowerUp(roomId, "right", server);
		}
		this.rooms[roomId].roomInterval = setInterval(() => {
			if (this.rooms[roomId].playerGoneCount == 2) {
				clearInterval(this.rooms[roomId].roomInterval);
				clearTimeout(this.rooms[roomId].leftPowerUpTimeout);
				clearTimeout(this.rooms[roomId].rightPowerUpTimeout);
				delete this.rooms[roomId];
			}
			else {
				if ((scorer = this.rooms[roomId].ball.move(
					[this.rooms[roomId].leftPlayer, this.rooms[roomId].rightPlayer])).length) {
					if (scorer == "left") {
						server.to(roomId).emit('updateScore',
							JSON.stringify({ scorer: scorer, score: this.rooms[roomId].leftPlayer.score }));
						if (this.rooms[roomId].leftPlayer.score == this.scoreToWin) {
							try {
								this.updateStats(this.rooms[roomId].leftPlayer,
									this.rooms[roomId].rightPlayer,
									this.rooms[roomId].powerUpMode);
								this.updateHistory(this.rooms[roomId].leftPlayer.id,
									this.rooms[roomId].rightPlayer.id,
									this.rooms[roomId].leftPlayer.score,
									this.rooms[roomId].rightPlayer.score);
								server.to(roomId).emit('endGame', scorer);
							}
							catch (error: any) {
							}
						}
					}
					else if (scorer == "right") {
						server.to(roomId).emit('updateScore',
							JSON.stringify({ scorer: scorer, score: this.rooms[roomId].rightPlayer.score }));
						if (this.rooms[roomId].rightPlayer.score == this.scoreToWin) {
							try {
								this.updateStats(this.rooms[roomId].rightPlayer,
									this.rooms[roomId].leftPlayer,
									this.rooms[roomId].powerUpMode);
								this.updateHistory(this.rooms[roomId].leftPlayer.id,
									this.rooms[roomId].rightPlayer.id,
									this.rooms[roomId].leftPlayer.score,
									this.rooms[roomId].rightPlayer.score);
								server.to(roomId).emit('endGame', scorer);
							}
							catch (error: any) {
							}
						}
					}
					scorer = "";
				}
				server.to(roomId).emit('moveBall', JSON.stringify(this.rooms[roomId].ball));
			}
		}, 10);
	}

	programNextPowerUp(roomId: string, position: string, server: Server) {
		let timeout: ReturnType<typeof setTimeout>;

		timeout = setTimeout(() => {
			server.to(roomId).emit('updateSpeedPowerUp', true, position);
			if (position == "left")
				this.rooms[roomId].leftPlayer.speedPowerUp = true;
			else
				this.rooms[roomId].rightPlayer.speedPowerUp = true;
		}, 10000);
		if (position == "left")
			this.rooms[roomId].leftPowerUpTimeout = timeout;
		else
			this.rooms[roomId].rightPowerUpTimeout = timeout;

	}

	useSpeedPowerUp(roomId: string, position: string, server: Server, userId: number): boolean
	{
		if (roomId in this.rooms && (position === 'left' &&
			this.rooms[roomId].leftPlayer.id === userId ||
			position === 'right' && this.rooms[roomId].rightPlayer.id === userId))
		{
			this.programNextPowerUp(roomId, position, server);
			this.rooms[roomId].ball.speedPowerUp();
			server.to(roomId).emit('updateSpeedPowerUp', false, position);
			if (position == "left")
				this.rooms[roomId].leftPlayer.speedPowerUp = false;
			else
				this.rooms[roomId].rightPlayer.speedPowerUp = false;
			return (true);
		}
		return (false);
	}

	// update customisation

	async updateSkin(userId: number, skin: string) {
		if (Skins.includes(skin)) {
			await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					skin: skin
				}
			});
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	async updateMap(userId: number, map: string) {
		if (Maps.includes(map)) {
			await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					map: map
				}
			});
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}

	// gateway's checks

	isUserIdConnected(userId: number)
	{
		for (let i = 0; i < this.playersConnected.length; ++i)
		{
			if (this.playersConnected[i].userId === userId)
				return (true);
		}
		return (false);
	}

	async checkCredentialsOnConnection(player: Socket)
	{
		const id = await getIdIfValid(player, this.config.get('JWT_SECRET'), this.userService);

		if (id)
		{
			if (this.isUserIdConnected(id))
				player.emit('error', new WsException('Already connected'));
			else
			{
				if (player.handshake.query.spectator === 'false')
					this.playersConnected.push({userId: id, socketId: player.id});
				return (id);
			}
		}
		return (0);
	}

	isConnectionValid(player: Socket): boolean
	{
		if (player.handshake.query.challenge === 'true')
		{
			if (!player.handshake.query.challengeId)
			{
				player.disconnect();
				return (false);
			}
		}
		else if (player.handshake.query.spectator === 'false')
		{
			if (!player.handshake.query.playerData)
			{
				player.disconnect();
				return (false);
			}
		}
		else
		{
			if (!player.handshake.query.roomId)
			{
				player.disconnect();
				return (false);
			}
		}
		return (true);
	}

	getIndexWithSocketId(socketId: string)
	{
		for (let i = 0; i < this.playersConnected.length; ++i)
		{
			if (this.playersConnected[i].socketId === socketId)
				return (i);
		}
		return (-1);
	}

	removeFromSocketConnected(player: Socket)
	{
		const playerIndex = this.getIndexWithSocketId(player.id);
		if (playerIndex !== -1)
			this.playersConnected.splice(playerIndex, 1);
	}

	isUserIdConnectedWithSocketId(userId: number, socketId: string)
	{
		for (let i = 0; i < this.playersConnected.length; ++i)
		{
			if (this.playersConnected[i].userId === userId && this.playersConnected[i].socketId === socketId)
				return (true);
		}
		return (false);
	}

	checkCredentialsOnEvent(player: Socket, token: string | undefined)
	{
		if (token === undefined)
		{
			player.emit('error', new WsException('Invalid credentials'));
			return (0);
		}
		try
		{
			const jwtDecoded: JwtDecoded = jwt_decode(token);
			const id: number = jwtDecoded.sub;
			if (!this.isUserIdConnectedWithSocketId(id, player.id))
			{
				player.emit('error', new WsException('Already connected'));
				return (0);
			}
			return (id);
		}
		catch (error: any)
		{
			player.emit('error', new WsException('Invalid credentials'));
		}
		return (0);
	}
}
