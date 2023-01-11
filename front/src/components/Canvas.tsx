import {useRef, useEffect} from "react";

import Ball from "../classes/Ball";
import Player from "../classes/Player";
import Draw from "../classes/Draw";
import {io, Socket} from "socket.io-client"

export default function Canvas()
{
	const canvasRef				= useRef(document.createElement("canvas"));
	const size					= useRef({width: 600, height: 350});
	const ctx					= useRef<CanvasRenderingContext2D | null>(null);
	const ball					= useRef<Ball>();
	const currentPlayer			= useRef<Player | null>(null);
	const opponent				= useRef<Player | null>(null);
	const animationFrameId		= useRef<number>(0);
	const kd					= useRef(require('keydrown'));
	const socket				= useRef<Socket | null>(null);
	const roomId				= useRef<string | null>(null);
	const draw					= useRef<Draw | null>(null);

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

		function launchGame(position : string)
		{
			let leftPlayerPos : Position = {posX : 75, posY : 100};
			let rightPlayerPos : Position = {posX : size.current.width - 100, posY : size.current.height - 100};

			if (position == "left")
			{
				currentPlayer.current = new Player(leftPlayerPos.posX, leftPlayerPos.posY, size.current.width / 60, size.current.height / 5, 4, "white", "left", ctx.current);
				opponent.current = new Player(rightPlayerPos.posX, rightPlayerPos.posY, size.current.width / 60, size.current.height / 5, 4, "white", "right", ctx.current);
			}
			else
			{
				currentPlayer.current = new Player(rightPlayerPos.posX, rightPlayerPos.posY, size.current.width / 60, size.current.height / 5, 4, "white", "right", ctx.current);
				opponent.current = new Player(leftPlayerPos.posX, leftPlayerPos.posY, size.current.width / 60, size.current.height / 5, 4, "white", "left", ctx.current);

			}
			socket.current!.on("ball", (arg : string) => {
					ball.current!.update_pos(JSON.parse(arg))});
			socket.current!.on("moveOpponent", (arg : string) => {
					opponent.current!.update_pos(JSON.parse(arg))
					});
			socket.current!.on("updateScore", (data : string) => {
					currentPlayer.current!.updateScore(JSON.parse(data).score.currentPlayer);
					opponent.current!.updateScore(JSON.parse(data).score.opponent);
					});

			kd.current.UP.down(function()
			{
				currentPlayer.current!.moveUp();
				socket.current!.emit("movePlayer", {currentPlayer : currentPlayer.current, roomId : roomId.current});
			});

			kd.current.DOWN.down(function()
			{
				currentPlayer.current!.moveDown();
				socket.current!.emit("movePlayer", {currentPlayer : currentPlayer.current, roomId : roomId.current});
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
					socket.current!.emit('joinRoom', JSON.parse(data).roomId)
					resolve(data);
				});
			}));
		}

		async function matchmaking()
		{
			let position : string = "";

			draw.current.matchmakingPage();
			socket.current = io(`ws://localhost:3333`, {transports: ["websocket"], /*query: { skin: (player.current === "playerA" ? playerA.current!.color : playerB.current!.color)}*/});
			socket.current!.on("connect", async () => {
			await findRoom().then(data => {
				roomId.current = JSON.parse(data).roomId;
				position = JSON.parse(data).position;
			});
			launchGame(position);
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
			ctx.current!.fillStyle = 'black';
			ctx.current?.fillRect(0, 0, size.current.width, size.current.height);
			ctx.current?.beginPath();
			ctx.current!.fillStyle = 'white';
			ctx.current?.moveTo(size.current.width / 2, 0);
			ctx.current?.lineTo(size.current.width / 2, size.current.height);
			ctx.current?.moveTo(0, 0);
			ctx.current?.lineTo(80, 80);
			ctx.current?.stroke();
			currentPlayer.current?.draw_paddle();
			opponent.current?.draw_paddle();
			currentPlayer.current?.draw_score();
			opponent.current?.draw_score();
			
			if (ball.current?.move([currentPlayer.current, opponent.current]))
			{
				socket.current!.emit("updateScore", {score : {currentPlayer : currentPlayer.current!.score, opponent : opponent.current!.score}, roomId : roomId.current});
			}
			
			ball.current?.draw();
			socket.current!.emit("ball", {ball : ball.current, roomId: roomId.current});
		}

		function render()
		{
			draw();
			animationFrameId.current = window.requestAnimationFrame(render)
		}

		ctx.current = canvasRef.current.getContext("2d");
		ball.current = new Ball(size.current.width / 2, size.current.height / 2, 10, "white", ctx.current!);
		draw.current = new Draw(ctx.current);
		createMenu();
		return () => { window.cancelAnimationFrame(animationFrameId.current) }

	}, []);

	return (<center><canvas id="canvas" style={{marginTop: 150}} width={size.current.width} height={size.current.height} ref={canvasRef}></canvas></center>);
}
