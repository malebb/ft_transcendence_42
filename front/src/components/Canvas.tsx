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
	const playerA				= useRef<Player | null>(null);
	const playerB				= useRef<Player | null>(null);
	const animationFrameId		= useRef<number>(0);
	const kd					= useRef(require('keydrown'));
	const socket				= useRef<Socket | null>(null);
	const roomId				= useRef<string | null>(null);
	const player				= useRef<string | null>(null);
	const draw					= useRef<Draw | null>(null);

	useEffect(() =>
	{

		interface TextZone{
			posX : number;
			posY : number;
			width : number;
			height : number;
		}

		function addLink(textZone : TextZone, linkAction : Function)
		{
			var canvas = document.getElementById('canvas');
			var	mouseOnZone : TextZone | null = null;
			var executeLink = (e : MouseEvent) =>
			{

				var clickZone = canvas!.getBoundingClientRect();

				if (e.clientX - clickZone.left >= textZone.posX &&
				e.clientX - clickZone.left <= textZone.posX + textZone.width)
				{
					if (e.clientY - clickZone.top >= textZone.posY &&
					e.clientY - clickZone.top <= textZone.posY + textZone.height)
					{
						canvas!.removeEventListener('click', executeLink);
						canvas!.removeEventListener('mousemove', drawMousePointer);
						canvas!.style.cursor = 'default';
						linkAction();
					}
				}
			};
			var drawMousePointer = (e : MouseEvent) =>
			{
				var clickZone = canvas!.getBoundingClientRect();

				if (e.clientX - clickZone.left >= textZone.posX &&
				e.clientX - clickZone.left <= textZone.posX + textZone.width)
				{
					if (e.clientY - clickZone.top >= textZone.posY &&
					e.clientY - clickZone.top <= textZone.posY + textZone.height)
					{
						canvas!.style.cursor = 'pointer';
						mouseOnZone = textZone;
					}
					else
					{
						if (mouseOnZone && mouseOnZone === textZone)
							canvas!.style.cursor = 'default';
					}
				}
				else
				{
						if (mouseOnZone && mouseOnZone === textZone)
							canvas!.style.cursor = 'default';
				}
			}
			canvas!.addEventListener('click', executeLink)
			canvas!.addEventListener('mousemove', drawMousePointer);
		}

		function launchGame()
		{
			playerA.current = new Player(75, 100, size.current.width / 60, size.current.height / 5, 4, "white", ctx.current);
			playerB.current = new Player(size.current.width - 100, size.current.height - 100, size.current.width / 60, size.current.height / 5, 4, "white", ctx.current);

			ball.current = new Ball(size.current.width / 2, size.current.height / 2, 10, "white", ctx.current!);

			socket.current!.on("ball", (arg : string) => {
					ball.current!.update_pos(JSON.parse(arg))});
			socket.current!.on("playerA", (arg : string) => {
					playerA.current!.update_pos(JSON.parse(arg))});
			socket.current!.on("playerB", (arg : string) => {
					playerB.current!.update_pos(JSON.parse(arg));});
			socket.current!.on("updateScore", (score : string) => {
					playerA.current!.updateScore(JSON.parse(score).playerA);
					playerB.current!.updateScore(JSON.parse(score).playerB);
					});

			kd.current.UP.down(function()
			{
				if (player.current === "playerA")
				{
					playerA.current!.moveUp();
					socket.current!.emit("playerA", {playerA : playerA.current, roomId : roomId.current});
				}
				else
				{
					playerB.current!.moveUp();
					socket.current!.emit("playerB", {playerB : playerB.current, roomId : roomId.current});
				}
			});

			kd.current.DOWN.down(function()
			{
				if (player.current === "playerA")
				{
					playerA.current!.moveDown();
					socket.current!.emit("playerA", {playerA : playerA.current, roomId : roomId.current});
				}
				else
				{
					playerB.current!.moveDown();
					socket.current!.emit("playerB", {playerB : playerB.current, roomId : roomId.current});
				}
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
					socket.current!.emit('joinRoom', data.roomId)
					player.current = data.player;
					resolve(data.roomId);
				});
			}));
		}


		async function matchmaking()
		{
			draw.current.matchmakingPage();
			socket.current = io(`ws://localhost:3333`, {transports: ["websocket"]});
			socket.current!.on("connect", async () => {
			await findRoom().then(id => {
				roomId.current = id;
			});
			launchGame();
			});
		}

		function skins()
		{
			draw.current.skinsPage();
		}

		function createMenu()
		{
			draw.current.menuBackground();

			let newGameZone = draw.current.text("new game", size.current.width / 2, size.current.height / 2, 35);
			let skinsZone = draw.current.text("skins", size.current.width / 4, size.current.height / 1.3, 20);
			let mapsZone = draw.current.text("maps", size.current.width / 1.3, size.current.height / 1.3, 20);

			addLink(newGameZone, matchmaking);
			addLink(skinsZone, skins);
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
			playerA.current?.draw_paddle();
			playerB.current?.draw_paddle();
			playerA.current?.draw_score(size.current.width / 3, size.current.height / 4);
			playerB.current?.draw_score(size.current.width - (size.current.width / 3 ) - 30, size.current.height / 4);
			
			if (ball.current?.move([playerA.current, playerB.current]))
			{
				socket.current!.emit("updateScore", {score : {playerA : playerA.current!.score, playerB : playerB.current!.score}, roomId : roomId.current});
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
		draw.current = new Draw(ctx.current);
		createMenu();
		return () => { window.cancelAnimationFrame(animationFrameId.current) }

	}, []);

	return (<center><canvas id="canvas" style={{marginTop: 150}} width={size.current.width} height={size.current.height} ref={canvasRef}></canvas></center>);
}
