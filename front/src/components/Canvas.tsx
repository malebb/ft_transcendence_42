import {useRef, useEffect} from "react";

import { Ball } from "ft_transcendence";
import { Player } from "ft_transcendence";
import Draw from "../classes/Draw";
import { io, Socket } from "socket.io-client"
import { Room } from "ft_transcendence" 

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
	const socket				= useRef<Socket | null>(null);
	const draw					= useRef<Draw | null>(null);
	const room					= useRef<Room | null>(null);
	const position				= useRef<string>("");

	useEffect(() =>
	{

		interface LinkZone
		{
			posX : number;
			posY : number;
			width : number;
			height : number;
		}

		interface Player
		{
			id : string;
			skin : string;
		}

		interface Position
		{
			posX : number;
			posY : number;
		}

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

		function addLink(textZone : LinkZone, linkAction : Function, zones : LinkZone[], data : any)
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
					zones.map(zone => {
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
	
					zones.map(zone => {
					if (mouseOnZone(e, zone))
						mouseOnOtherZone = true;
					});
					if (!mouseOnOtherZone)
						canvas!.style.cursor = 'default';
				}
			}
			canvas!.addEventListener('click', executeLink)
			canvas!.addEventListener('mousemove', drawMousePointer);
		}

		function launchGame()
		{
			leftPlayer.current = Object.assign(new Player(0, 0, 0, 0, 0, "", "", null, null), room.current!.leftPlayer);
			rightPlayer.current = Object.assign(new Player(0, 0, 0, 0, 0, "", "", null, null), room.current!.rightPlayer);

			leftPlayer.current.setCtx(ctx.current!);
			rightPlayer.current.setCtx(ctx.current!);

			ball.current = Object.assign(new Ball(0, 0, 0, "white", null, null), room.current!.ball);
			ball.current.setCtx(ctx.current!);

			socket.current!.on("moveBall", (arg : string) => {
					ball.current!.update_pos(JSON.parse(arg))
			});

			socket.current!.on("movePlayer", (arg : string) => {
				let data = JSON.parse(arg);

				if (data.position == "left")
					leftPlayer.current!.update_pos(data.player)
				else if (data.position == "right")
					rightPlayer.current!.update_pos(data.player)
			});

			socket.current!.on("updateScore", (scoreData: string) => {
				let scoreDataObj = JSON.parse(scoreData);

				if (scoreDataObj.scorer == "left")
					leftPlayer.current!.updateScore(scoreDataObj.score);
				else if (scoreDataObj.scorer == "right")
					rightPlayer.current!.updateScore(scoreDataObj.score);
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

			render();
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

		async function matchmaking()
		{
			draw.current.matchmakingPage();
			socket.current = io(`ws://localhost:3333`, {transports: ["websocket"]});
			socket.current!.on("connect", async () => {
			await findRoom().then(data => {
				room.current = JSON.parse(data).room;
				position.current = JSON.parse(data).position;
			});
			launchGame();
			});
		}

		function changeSkin(name : string)
		{
			draw.current.skins = [];

			// TODO : update skin in database
			// ...

			console.log('You\'ve selected ' + name + ' skin');
			createMenu();
		}

		function skins()
		{
			let colouredSkins : string[] = ["white", "blue", "yellow", "orange", "pink", "purple", "green", "grey", "red", "cyan"];
			let skinLinkZones : LinkZone[] = [];

			draw.current!.skinsBackground();
			colouredSkins.map(
			color => {
				let skinLinkZone = draw.current!.skin(color)
				skinLinkZones.push(skinLinkZone);
			}
			);
			skinLinkZones.map(
			skinLinkZone => {
				addLink(skinLinkZone, changeSkin, skinLinkZones, colouredSkins[skinLinkZones.indexOf(skinLinkZone)]);
			}
			);
		}

		function createMenu()
		{
			draw.current.menuBackground();

			let newGameZone = draw.current.text("new game", size.current.width / 2, size.current.height / 2, 35);
			let skinsZone = draw.current.text("skins", size.current.width / 4, size.current.height / 1.3, 20);
			let mapsZone = draw.current.text("maps", size.current.width / 1.3, size.current.height / 1.3, 20);
			let zones = [newGameZone, skinsZone, mapsZone];

			addLink(newGameZone, matchmaking, zones, 0);
			addLink(skinsZone, skins, zones, 0);
		}

		function draw()
		{
			draw.current!.map();
			leftPlayer.current?.draw_paddle();
			leftPlayer.current?.draw_score();
			rightPlayer.current?.draw_paddle();
			rightPlayer.current?.draw_score();
			ball.current?.draw();
		}

		function render()
		{
			draw();
			animationFrameId.current = window.requestAnimationFrame(render)
		}

		ctx.current = canvasRef.current.getContext("2d");
		draw.current = new Draw(ctx.current);
		createMenu();
		return () => { window.cancelAnimationFrame(animationFrameId.current) }

	}, []);

	return (<center><canvas id="canvas" style={{marginTop: 150}} width={size.current.width} height={size.current.height} ref={canvasRef}></canvas></center>);
}
