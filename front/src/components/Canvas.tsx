import { useRef, useEffect } from "react";
import { Ball } from "ft_transcendence";
import { Player } from "ft_transcendence";
import Draw from "../classes/Draw";
import { io, Socket } from "socket.io-client";
import { Room } from "ft_transcendence";
import LinkZone from "../interfaces/LinkZone";
import { axiosToken, getToken } from '../api/axios';
import { AxiosResponse } from 'axios';

export default function Canvas()
{
	const canvasRef				= useRef(document.createElement("canvas"));
	const size					= useRef({width: 600, height: 350});
	const ctx					= useRef<CanvasRenderingContext2D | null>(null);
	const ball					= useRef<Ball>();
	const leftPlayer			= useRef<Player | null>(null);
	const rightPlayer			= useRef<Player | null>(null);
	const animationFrameId		= useRef<number>(0);
	const kd					= useRef(require('keydrown'));
	const keyPressed			= useRef<boolean>(false);
	const socket				= useRef<Socket | null>(null);
	const draw					= useRef<Draw | null>(null);
	const room					= useRef<Room | null>(null);
	const position				= useRef<string>("");
	const map					= useRef<HTMLImageElement | null>(null);
	const speedPowerUp			= useRef<HTMLImageElement | null>(null);
	const user					= useRef<AxiosResponse | null>(null);

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

		function stopGame()
		{
			window.cancelAnimationFrame(animationFrameId.current)
			socket.current!.disconnect();
			kd.current.stop();
			document!.removeEventListener('keypress', powerUp);
			document!.removeEventListener('keyup', notifyKeyReleased);
		}

		function opponentDisconnection()
		{
			stopGame();
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				draw.current!.opponentDisconnection();

				let menuZone = draw.current!.text("menu", size.current.width / 4, size.current.height / 1.3, 20, "black", "Courier New");
				let newGameZone = draw.current!.text("new game", size.current.width / 1.3, size.current.height / 1.3, 20, "black", "Courier New");
				let zones = [newGameZone, menuZone];

				addLink(newGameZone, matchmaking, zones, 0);
				addLink(menuZone, menu, zones, 0);
			}
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

				let menuZone = draw.current!.text("menu", size.current.width / 4, size.current.height / 1.3, 20, "black", "Courier New");
				let newGameZone = draw.current!.text("new game", size.current.width / 1.3, size.current.height / 1.3, 20, "black", "Courier New");
				let zones = [newGameZone, menuZone];

				addLink(newGameZone, matchmaking, zones, 0);
				addLink(menuZone, menu, zones, 0);
			}
		}

		function notifyKeyReleased()
		{
			keyPressed.current = false;
		}

		function powerUpEnabled()
		{
			return ((position.current == "left" && leftPlayer.current!.speedPowerUp) ||
			(position.current == "right" && rightPlayer.current!.speedPowerUp))
		}

		function powerUp(e: KeyboardEvent)
		{
			if (keyPressed.current)
				return;
			if (e.key == ' ' && powerUpEnabled())
			{
				socket.current!.emit("speedPowerUp", {roomId : room.current!.id, position: position.current});
				keyPressed.current = true;
			}
		}

		function updateSpeedPowerUp(status: boolean, position: string)
		{
			if (position == "left")
				leftPlayer.current!.speedPowerUp = status;
			else if (position == "right")
				rightPlayer.current!.speedPowerUp = status;
		}

		function launchGame()
		{
			let canvas = document.getElementById('canvas');

			leftPlayer.current = Object.assign(new Player(0, 0, 0, 0, 0, "", "", null, null), room.current!.leftPlayer);
			rightPlayer.current = Object.assign(new Player(0, 0, 0, 0, 0, "", "", null, null), room.current!.rightPlayer);

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

			socket.current!.on("updateSpeedPowerUp", (status: boolean, position: string) =>
			{
				updateSpeedPowerUp(status, position);
			});

			kd.current.UP.down(function()
			{
				socket.current!.emit("movePlayer", {roomId : room.current!.id, position: position.current, key: "UP"});
			});

			kd.current.DOWN.down(function()
			{
				socket.current!.emit("movePlayer", {roomId : room.current!.id, position: position.current, key: "DOWN"});
			})

			kd.current.run(function () {
				kd.current.tick();
			});

			document.addEventListener('keypress', powerUp);
			document.addEventListener('keyup', notifyKeyReleased);

			// TODO fetch user selected map in database

			map.current = draw.current!.initGameMap('basic');
			map.current!.onload = function()
			{
				speedPowerUp.current = draw.current!.initSpeedPowerUp();
				speedPowerUp.current!.onload = function()
				{
					render();
				}
			}
		}

		function findRoom() : Promise<string>
		{
			return (new Promise(resolve => {
				socket.current!.on(socket.current!.id, (data) => {
					socket.current!.emit('joinRoom', JSON.parse(data).room.id)
					resolve(data);
				});
			}));
		}

		function cancelMatchmaking()
		{
			socket.current!.disconnect();
			menu();
		}

		async function matchmaking()
		{
			let cancelLink: Function[];
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				draw.current!.matchmaking();

				let cancelZone = draw.current!.text("cancel", size.current.width / 2, size.current.height / 1.3, 20, "black", "Courier New");

				let zones = [cancelZone];
	
				socket.current = io(`ws://localhost:3333`, {transports: ["websocket"]});
				cancelLink = addLink(cancelZone, cancelMatchmaking, zones, 0);
				socket.current!.on("connect", async () => {
					await findRoom().then(data => {
						room.current = JSON.parse(data).room;
						position.current = JSON.parse(data).position;
					});
					destroyLink(cancelLink);
					launchGame();
				});
			}
		}

		function changeSkin(name : string)
		{
			draw.current!.skins = [];

			// TODO : update skin in database
			// ...

			console.log('You\'ve selected ' + name + ' skin');
			menu();
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

		function changeMap(name: string)
		{
			// TODO : update map in database
			// ...

			console.log("you've selected ", name, " map");
			menu();
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

		function menu()
		{
			let background: HTMLImageElement = draw.current!.initOutGameBackground();

			background.onload = function()
			{
				draw.current!.outGameBackground(background);
				let newGameZone = draw.current!.text("new game", size.current.width / 2, size.current.height / 2, 35, "black", "Courier New");
				let skinsZone = draw.current!.text("skins", size.current.width / 4, size.current.height / 1.3, 20, "black", "Courier New");
				let mapsZone = draw.current!.text("maps", size.current.width / 1.3, size.current.height / 1.3, 20, "black", "Courier New");
				let zones = [newGameZone, skinsZone, mapsZone];

				addLink(newGameZone, matchmaking, zones, 0);
				addLink(skinsZone, skins, zones, 0);
				addLink(mapsZone, maps, zones, 0);
			}
		}

		function game()
		{
			draw.current!.gameMap(map.current!);
			leftPlayer.current!.draw_paddle();
			rightPlayer.current!.draw_paddle();
			draw.current!.score(leftPlayer.current!.score, rightPlayer.current!.score);
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
			
		}

		async function initUser()
		{
			user.current = await axiosToken().get('/users/me', {});
			console.log("le susnomme user = ", user.current);
		}

		ctx.current = canvasRef.current.getContext("2d");
		draw.current = new Draw(ctx.current);
		if (getToken() == null)
		{
			console.log("You need to sign in");
			//signInToPlayer();
		}
		else
		{
			await initUser();
			menu();
		}
		}
		pong().catch(console.error);
		return () => { 
			window.cancelAnimationFrame(animationFrameId.current)
		}

	}, []);
	return (
	<center>
		<canvas id="canvas" style={{marginTop: 150}} width={size.current.width} height={size.current.height} ref={canvasRef}></canvas>
	</center>
	);
}
