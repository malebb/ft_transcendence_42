import { useRef, useEffect, useState, useContext, useCallback } from "react";
import Draw from "src/classes/Draw";
import { io, Socket } from "socket.io-client";
import { Ball, Room, Player, PlayerData, User } from "ft_transcendence";
import LinkZone from "src/interfaces/LinkZone";
import { AxiosInstance, AxiosResponse } from 'axios';
import { useParams , Link} from 'react-router-dom';
import { CANVAS_FONT, FONT_COLOR } from "src/classes/Draw";
import style from 'src/styles/canvas.module.css';
import { trimUsername } from "src/utils/trim";
import AuthContext from "src/context/TokenContext";
import useAxiosPrivate from "src/hooks/usePrivate";
import { SocketContext } from "src/context/SocketContext";

interface CheckboxData
{
	checkbox: HTMLImageElement;
	checked: HTMLImageElement;
	zones: LinkZone[];
}

export default function Canvas()
{
	const canvasRef							= useRef(document.createElement("canvas"));
	const size								= useRef({width: 700, height: 450});
	const ctx								= useRef<CanvasRenderingContext2D | null>(null);
	const ball								= useRef<Ball>();
	const leftPlayer						= useRef<Player | null>(null);
	const rightPlayer						= useRef<Player | null>(null);
	const animationFrameId					= useRef<number>(0);
	const kd								= useRef(require('keydrown'));
	const keyPressed						= useRef<boolean>(false);
	const socket							= useRef<Socket | null>(null);
	const draw								= useRef<Draw | null>(null);
	const room								= useRef<Room | null>(null);
	const position							= useRef<string>("");
	const map								= useRef<HTMLImageElement | null>(null);
	const speedPowerUp						= useRef<HTMLImageElement | null>(null);
	const powerUpMode						= useRef<boolean>(false);
	const axiosInstance						= useRef<AxiosInstance | null>(null);
	const {challengeId}						= useParams()
	const [isChallenger, setIsChallenger]	= useState(true);
	const statusSocket = useContext(SocketContext);
	const axiosPrivate = useAxiosPrivate();
	const { token } = useContext(AuthContext);

	const powerUpEnabled = useCallback (() =>
	{
		return ((position.current === "left" && leftPlayer.current!.speedPowerUp) ||
		(position.current === "right" && rightPlayer.current!.speedPowerUp))
	}, []);

	const powerUp = useCallback(async (e: KeyboardEvent) =>
	{
		if (keyPressed.current)
			return;
		if (e.key === ' ' && powerUpEnabled())
		{
			socket.current!.emit("speedPowerUp", {roomId : room.current!.id, position: position.current});
			keyPressed.current = true;
		}
	}, [powerUpEnabled]);

	function notifyKeyReleased()
	{
		keyPressed.current = false;
	}

	const stopGame = useCallback(() =>
	{
		statusSocket.emit('ONLINE');
		window.cancelAnimationFrame(animationFrameId.current)
		kd.current.stop();
		document!.removeEventListener('keypress', powerUp);
		document!.removeEventListener('keyup', notifyKeyReleased);
		socket.current!.disconnect();
	}, [statusSocket, powerUp]);

	useEffect(() =>
	{
		const pong = async () => 
		{
			function mouseOnZone(e : MouseEvent, textZone : LinkZone) : boolean
			{
				var canvas = document.getElementById('canvas');
				var clickZone = canvas!.getBoundingClientRect();
	
				if (e.clientX - clickZone.left >= textZone.posX &&
					e.clientX - clickZone.left <= textZone.posX + textZone.width)
				{
					if (e.clientY - clickZone.top >= textZone.posY &&
					e.clientY - clickZone.top <= textZone.posY + textZone.height)
					{
						return (true);
					}
				}
				return (false);
			}

		function addLink(textZone : LinkZone, linkAction : Function, zones : LinkZone[], data : any) : Function []
		{
			var canvas = document.getElementById('canvas');
			var executeLink = (e : MouseEvent) =>
			{
				if (mouseOnZone(e, textZone))
				{
					canvas!.removeEventListener('click', executeLink);
					canvas!.removeEventListener('mousemove', drawMousePointer);
					canvas!.style.cursor = 'default';
					linkAction(data);
				}
				else
				{
						zones.forEach(zone => {
						if (mouseOnZone(e, zone))
						{
							canvas!.removeEventListener('click', executeLink);
							canvas!.removeEventListener('mousemove', drawMousePointer);
							canvas!.style.cursor = 'default';
						}
						});
				}
			};

			var drawMousePointer = (e : MouseEvent) =>
			{
				if (mouseOnZone(e, textZone))
					canvas!.style.cursor = 'pointer';
				else
				{
					var		mouseOnOtherZone : boolean = false;
	
					zones.forEach(zone => {
					if (mouseOnZone(e, zone))
						mouseOnOtherZone = true;
					});
					if (!mouseOnOtherZone)
						canvas!.style.cursor = 'default';
				}
			}
			canvas!.addEventListener('click', executeLink)
			canvas!.addEventListener('mousemove', drawMousePointer);
			return ([executeLink, drawMousePointer]);
		}

		function destroyLink(link : any[])
		{
			var canvas = document.getElementById('canvas');

			canvas!.removeEventListener('click', link[0]);
			canvas!.removeEventListener('mousemove', link[1]);
		}

		function opponentDisconnection()
		{
			stopGame();
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				draw.current!.opponentDisconnection();

				if (challengeId === undefined)
				{
					let menuZone = draw.current!.text("menu", size.current.width / 4, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let newGameZone = draw.current!.text("new game", size.current.width / 1.3, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let zones = [newGameZone, menuZone];

					addLink(newGameZone, matchmaking, zones, 0);
					addLink(menuZone, menu, zones, 0);
				}
				else
				{
					let menuZone = draw.current!.text("menu", size.current.width / 2, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let zones = [menuZone];
					addLink(menuZone, redirectAfterChallenge, zones, 0);
				}
			}
		}

		function redirectAfterChallenge()
		{
			window.location.href = 'http://localhost:3000/';
		}

		function result(status: string)
		{
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				if (status === "won")
					draw.current!.youWon();
				else
					draw.current!.youLost();

				if (challengeId === undefined)
				{
					let menuZone = draw.current!.text("menu", size.current.width / 4, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let newGameZone = draw.current!.text("new game", size.current.width / 1.3, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let zones = [newGameZone, menuZone];

					addLink(newGameZone, matchmaking, zones, 0);
					addLink(menuZone, menu, zones, 0);
				}
				else
				{
					let menuZone = draw.current!.text("menu", size.current.width / 2, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let zones = [menuZone];
					addLink(menuZone, redirectAfterChallenge, zones, 0);
				}
			}
		}

		function updateSpeedPowerUp(status: boolean, position: string)
		{
			if (position === "left")
				leftPlayer.current!.speedPowerUp = status;
			else if (position === "right")
				rightPlayer.current!.speedPowerUp = status;
		}

		async function launchGame()
		{
			statusSocket.emit('IN_GAME');
			leftPlayer.current = Object.assign(new Player(0, 0, 0, 0, 0, "", "", "", 0, null, null), room.current!.leftPlayer);
			rightPlayer.current = Object.assign(new Player(0, 0, 0, 0, 0, "", "", "", 0, null, null), room.current!.rightPlayer);

			leftPlayer.current.setCtx(ctx.current!);
			rightPlayer.current.setCtx(ctx.current!);

			ball.current = Object.assign(new Ball(0, 0, 0, "white", 0, null, null), room.current!.ball);
			ball.current.setCtx(ctx.current!);

			socket.current!.on("moveBall", (arg : string) => {
					ball.current!.update_pos(JSON.parse(arg))
			});

			socket.current!.on("movePlayer", (arg : string) => {
				let data = JSON.parse(arg);

				if (data.position === "left")
					leftPlayer.current!.update_pos(data.player)
				else if (data.position === "right")
					rightPlayer.current!.update_pos(data.player)
			});

			socket.current!.on("updateScore", (scoreData: string) => {
				let scoreDataObj = JSON.parse(scoreData);

				if (scoreDataObj.scorer === "left")
					leftPlayer.current!.updateScore(scoreDataObj.score);
				else if (scoreDataObj.scorer === "right")
					rightPlayer.current!.updateScore(scoreDataObj.score);
			});

			socket.current!.on("opponentDisconnection", () =>
			{
				opponentDisconnection();
			});

			socket.current!.on("endGame", (winner: string) =>
			{
				stopGame();
				if (winner === position.current)
					result("won");
				else
					result("lost");
			});

			if (room.current!.powerUpMode)
			{
				socket.current!.on("updateSpeedPowerUp", (status: boolean, position: string) =>
				{
					updateSpeedPowerUp(status, position);
				});
			}

			kd.current.UP.down(async function()
			{
				socket.current!.emit("movePlayer", {roomId : room.current!.id, position: position.current, key: "UP"});
			});

			kd.current.DOWN.down(async function()
			{
				socket.current!.emit("movePlayer", {roomId : room.current!.id, position: position.current, key: "DOWN"});
			})

			kd.current.run(function () {
				kd.current.tick();
			});

			document.addEventListener('keypress', powerUp);
			document.addEventListener('keyup', notifyKeyReleased);
			// TODO fetch user selected map in database

			try
			{
				axiosInstance.current = axiosPrivate;
				const user: AxiosResponse = await axiosInstance.current!.get('/users/me');
				map.current = draw.current!.initGameMap(user.data.map);
				map.current!.onload = function()
				{
					speedPowerUp.current = draw.current!.initSpeedPowerUp();
					speedPowerUp.current!.onload = function()
					{
						render();
					}
				}
			}
			catch (error: any)
			{
				console.log('error (init game map) :', error);
			}
		}

		function findRoom() : Promise<string | null>
		{
			return (new Promise(resolve => {
				socket.current!.on(socket.current!.id, async (data) => {
					socket.current!.emit('joinRoom', {roomId: JSON.parse(data).room.id})
					resolve(data);
				});
				socket.current!.on('error', () => {
					resolve(null);
				});
			}));
		}

		function cancelMatchmaking()
		{
			socket.current!.disconnect();
			menu();
		}

		function getOpponentUsername(user: AxiosResponse, challenge: AxiosResponse)
		{
			return (user.data.username === challenge.data.sender.username ? challenge.data.receiver.username : challenge.data.sender.username);
		}

		function alreadyInResearch()
		{
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				draw.current!.error();

				if (challengeId === undefined)
				{
					let menuZone = draw.current!.text("menu", size.current.width / 2, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let zones = [menuZone];

					addLink(menuZone, menu, zones, 0);
				}
				else
				{
					let menuZone = draw.current!.text("menu", size.current.width / 2, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let zones = [menuZone];
					addLink(menuZone, redirectAfterChallenge, zones, 0);
				}
			}
		}

		function alreadyInGame()
		{
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				draw.current!.alreadyInGame();
				if (challengeId === undefined)
				{
					let menuZone = draw.current!.text("menu", size.current.width / 2, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let zones = [menuZone];

					addLink(menuZone, menu, zones, 0);
				}
				else
				{
					let menuZone = draw.current!.text("menu", size.current.width / 2, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
					let zones = [menuZone];
					addLink(menuZone, redirectAfterChallenge, zones, 0);
				}
			}
		}

		async function initChallenge()
		{
			try
			{
				axiosInstance.current = axiosPrivate;
				let user: AxiosResponse = await axiosInstance.current!.get('/users/me');
				axiosInstance.current = axiosPrivate;
				const currentGames: AxiosResponse = await axiosInstance.current.get('/game/');

				if (isPlayerAlreadyInGame(user.data, currentGames))
				{
					alreadyInGame();
					return ;
				}
				axiosInstance.current = axiosPrivate;
				let challenge: AxiosResponse = await axiosInstance.current!.get('/challenge/' + challengeId);
				let cancelLink: Function[];
				let background: HTMLImageElement = draw.current!.initOutGameBackground();

				background.onload = async function()
				{
					draw.current!.outGameBackground(background);
					draw.current!.challenge(trimUsername(getOpponentUsername(user, challenge), 15));
	
					let cancelZone = draw.current!.text("cancel challenge", size.current.width / 2, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
	
					let zones = [cancelZone];
					let playerData: PlayerData = {userId: user.data.id, id: "", username: user.data.username, skin: user.data.skin, powerUpMode: challenge.data.powerUpMode};
					let gamePossible = true;
					axiosInstance.current = axiosPrivate;
					socket.current = io(`ws://localhost:3333/pong`,
					{
						transports: ["websocket"],
						query:	{
									playerData: JSON.stringify(playerData),
									spectator: false,
									challenge: true,
									challengeId: challenge.data.id
								},
						auth: {
							token: token!.access_token
						},
						forceNew: true
					});
					cancelLink = addLink(cancelZone, redirectAfterChallenge, zones, 0);
					socket.current!.on("connect", async () => {
						await findRoom().then(data => {
							if (data)
							{
								room.current = JSON.parse(data).room;
								position.current = JSON.parse(data).position;
							}
							else
								gamePossible = false;
						});
						destroyLink(cancelLink);
						if (gamePossible)
							await launchGame();
						else
							alreadyInResearch()
					});
				}
			}
			catch (error: any)
			{
				console.log('error:', error);
			}
		}

		function isPlayerAlreadyInGame(player: User, currentGames: AxiosResponse)
		{
			for (let i = 0; i < currentGames.data.length; ++i)
			{
				if (currentGames.data[i].leftPlayer.id === 
				player.id || currentGames.data[i].rightPlayer.id === 
				player.id)
					return (true);
			}
			return (false);
		}

		async function matchmaking()
		{
			let cancelLink: Function[];
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = async function()
			{
				try
				{
					axiosInstance.current = axiosPrivate;
					const user: AxiosResponse = await axiosInstance.current.get('/users/me');
					draw.current!.outGameBackground(background);
					draw.current!.matchmaking();

					let cancelZone = draw.current!.text("cancel", size.current.width / 2, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);

						let zones = [cancelZone];
					let playerData: PlayerData = {userId: user.data.id, id: "", username: user.data.username, skin: user.data.skin, powerUpMode: powerUpMode.current};
					let alreadyInQueue = false;
					axiosInstance.current = axiosPrivate;
					socket.current = io(`ws://localhost:3333/pong`,
					{
						transports: ["websocket"],
						query:	{
									playerData: JSON.stringify(playerData),
									spectator: false,
									challenge: false
								},
						auth: {
							token: token!.access_token
						},
						forceNew: true
					});
					cancelLink = addLink(cancelZone, cancelMatchmaking, zones, 0);
					socket.current!.on("connect", async () => {
						await findRoom().then(data => {
							if (data)
							{
								room.current = JSON.parse(data).room;
								position.current = JSON.parse(data).position;
							}
							else
								alreadyInQueue = true;
						});
						destroyLink(cancelLink);
						if (!alreadyInQueue)
							await launchGame();
						else
							alreadyInResearch();
					});
				}
				catch (error: any)
				{
					console.log('error (matchmaking) :', error);
				}
			} 
		}

		async function changeSkin(name : string)
		{
			try
			{
				draw.current!.skins = [];
				axiosInstance.current = axiosPrivate;
				await axiosInstance.current!.patch('/pong/skin', {skin: name}, {headers: { "Content-type": "application/json"}});
				menu();
			}
			catch (error: any)
			{
				console.log("error (change skin) :", error);
			}
		}

		function skins()
		{
			let colouredSkins : string[] = ["white", "blue", "yellow", "orange", "pink", "purple", "green", "grey", "red", "cyan"];
			let skinLinkZones : LinkZone[] = [];
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				draw.current!.skinsTitle();
				colouredSkins.forEach(color => {
					let skinLinkZone = draw.current!.skin(color)
					skinLinkZones.push(skinLinkZone);
				});
				skinLinkZones.forEach(skinLinkZone => {
				addLink(skinLinkZone, changeSkin, skinLinkZones, colouredSkins[skinLinkZones.indexOf(skinLinkZone)]);
			});
			}
		}

		async function changeMap(name: string)
		{
			try
			{
				axiosInstance.current = axiosPrivate;
				await axiosInstance.current!.patch('/pong/map', {map: name}, {headers: { "Content-type": "application/json"}});
				menu();
			}
			catch (error: any)
			{
				console.log('error: (change map) :', error);
			}
		}

		function maps()
		{
			let background: HTMLImageElement = draw.current!.initOutGameBackground();
			let mapLinkZones: LinkZone[] = [];

			background.onload = function ()
			{
				draw.current!.outGameBackground(background);
				draw.current!.mapsTitle();
				mapLinkZones = draw.current!.map();
				mapLinkZones.forEach((mapLinkZone: LinkZone) => {
					addLink(mapLinkZone, changeMap, mapLinkZones, draw.current!.mapList[mapLinkZones.indexOf(mapLinkZone)].name);
				});
			}
		}

		function switchToPowerUpMode(checkboxData: CheckboxData)
		{
			let checkboxZone = draw.current!.checkbox(checkboxData.checkbox);

			powerUpMode.current = powerUpMode.current ? false : true;

			draw.current!.updateCheckboxStatus();
			draw.current!.checked(checkboxData.checked);
			addLink(checkboxZone, switchToPowerUpMode, checkboxData.zones, checkboxData);
		}

		function menu()
		{
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				let checkbox: HTMLImageElement = draw.current!.initCheckbox();

				checkbox.onload = function()
				{
					let checked: HTMLImageElement = draw.current!.initChecked();

					checked.onload = function()
					{
						draw.current!.outGameBackground(background);
						draw.current!.checkbox(background);
						let newGameZone = draw.current!.text("new game", size.current.width / 2, size.current.height / 2, 35, FONT_COLOR, CANVAS_FONT);
						let skinsZone = draw.current!.text("skins", size.current.width / 4, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
						let mapsZone = draw.current!.text("maps", size.current.width / 1.3, size.current.height / 1.3, 20, FONT_COLOR, CANVAS_FONT);
						draw.current!.text("Power-up", size.current.width / 2.1, size.current.height / 1.66, 16, FONT_COLOR, CANVAS_FONT);
						let checkboxZone = draw.current!.checkbox(checkbox);
						draw.current!.checked(checked);

						let zones = [newGameZone, skinsZone, mapsZone];
	
						addLink(newGameZone, matchmaking, zones, 0);
						addLink(skinsZone, skins, zones, 0);
						addLink(mapsZone, maps, zones, 0);
						addLink(checkboxZone, switchToPowerUpMode, zones, {checkbox: checkbox, checked: checked, zones: zones});
					}
				}
			}
		}

		function game()
		{
			draw.current!.gameMap(map.current!);
			leftPlayer.current!.draw_paddle();
			rightPlayer.current!.draw_paddle();
			draw.current!.score(leftPlayer.current!.score, rightPlayer.current!.score);
			draw.current!.usernames(trimUsername(leftPlayer.current!.username, 15), trimUsername(rightPlayer.current!.username, 15));
			draw.current!.speedPowerUp(speedPowerUp.current!, leftPlayer.current!.speedPowerUp, rightPlayer.current!.speedPowerUp);
			ball.current?.draw();
		}

		function render()
		{
			game();
			animationFrameId.current = window.requestAnimationFrame(render)
		}

		function signInToPlay()
		{
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				draw.current!.signInToPlay();

			}
		}

		if (challengeId !== undefined)
		{
			try
			{
				axiosInstance.current = axiosPrivate;
				await axiosInstance.current!.get('/challenge/' + challengeId);
			}
			catch (error: any)
			{
				setIsChallenger(false);
			}
		}
		else
			setIsChallenger(false);
		ctx.current = canvasRef.current.getContext("2d");
		draw.current = new Draw(ctx.current);
		let googleFont = draw.current!.initFont();
		document.fonts.add(googleFont);
		googleFont.load().then(() =>
		{
			if (!token)
			{
				signInToPlay();
				return (false);
			}
			else
			{
				if (challengeId ===  undefined)
					menu();
				else
					initChallenge();
				return (true);
			}
		});
		}
		
		pong();
		return () =>
		{
			if (socket.current != null)
				stopGame();
			statusSocket.emit('ONLINE');
		}
	}, [challengeId, statusSocket, powerUp, stopGame, token, axiosPrivate]);

	useEffect(() => {
		if (socket.current != null)
			stopGame();
		statusSocket.emit('ONLINE');
	}, [statusSocket, stopGame]);

	const challengeTitle = () =>
	{
		return (isChallenger ? <h4 id={style.challengeTitle}>Challenge</h4> : <></>);
	}

	const displayControls = () =>
	{
		return (token ? 
				<div id={style.controlsContainer}>
					<h4>Controls</h4>
					<ul id="controls">
						<li>Move up : <span>UP ARROW</span></li>
						<li>Move down : <span>DOWN ARROW</span></li>
						<li>Use power up : <span>SPACE</span></li>
					</ul>
				</div> : <></>);
	}

	const displayCanvas = () =>
	{
		if (challengeId === undefined || isChallenger)
		{
			return (
			<>
				{challengeTitle()}
				<center><canvas id="canvas" style={{marginTop: 10}} width={size.current.width} height={size.current.height} ref={canvasRef}></canvas></center>
				{displayControls()}
			</>
			);
		}
		else
			return (
			<div id={style.noChallenge}>
				<p id={style.challengeFinished}>You can not access this challenge</p>
					<Link to={`/`}><button id={style.homeBtn}>Home</button></Link>
			</div>
			);
	}

	return (
	<>
		{displayCanvas()}
	</>
	);
}
