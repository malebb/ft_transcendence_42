import {useRef, useEffect} from "react";

import Ball from "../classes/Ball";
import Player from "../classes/Player";
import io   from "socket.io-client"

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
	const socket				= useRef(io(`ws://localhost:3333`, {transports: ["websocket"]}));

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

		function getTextZone(text: string, posX : number, posY : number)
		{
			let	gamezone : TextMetrics = ctx.current!.measureText(text);

			return ({posX : posX - gamezone.actualBoundingBoxLeft, posY : posY - gamezone.fontBoundingBoxAscent,
			height: gamezone.fontBoundingBoxAscent + gamezone.fontBoundingBoxDescent,
			width : gamezone.width});
		}

		function drawText(text : string, posX : number, posY : number, size : number)
		{
			let	textZone : TextZone | undefined;

			ctx.current!.beginPath();
			ctx.current!.fillStyle = "pink";
			ctx.current!.font = size + "px Courier New";
			ctx.current!.textAlign = 'center';
			ctx.current!.fillText(text, posX, posY);
			textZone = getTextZone(text, posX, posY);
			return (textZone);
		}

		function drawMatchmaking()
		{
			ctx.current!.fillStyle = 'black';
			ctx.current!.fillRect(0, 0, size.current.width, size.current.height);
			drawText("looking for player...", size.current.width / 2, size.current.height / 2, 35);
		}

		function drawMenu()
		{
			ctx.current!.fillStyle = 'black';
			ctx.current!.fillRect(0, 0, size.current.width, size.current.height);

			let newGameZone = drawText("new game", size.current.width / 2, size.current.height / 2, 35);
			let skinsZone = drawText("skins", size.current.width / 4, size.current.height / 1.3, 20);
			let mapsZone = drawText("maps", size.current.width / 1.3, size.current.height / 1.3, 20);
			//let menuElem = [newGameZone, skinsZone, mapsZone];
//			ctx.current!.fillStyle = "rgba(255, 0, 0, 0.5)";
//			ctx.current!.fillRect(newGameZone.posX, newGameZone.posY, newGameZone.width, newGameZone.height);
//			console.log("width = ", newGameZone!.width);
			addLink(newGameZone, drawMatchmaking);
//			menuElem.map((zone) => {addLink(zone!)})
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
			ball.current?.move([playerA.current, playerB.current]);
			ball.current?.draw();
			socket.current.emit("ball", ball);
		}

		function render()
		{
			draw();
			animationFrameId.current = window.requestAnimationFrame(render)
		}

		ctx.current = canvasRef.current.getContext("2d");
		drawMenu();
		playerA.current = new Player(75, 100, size.current.width / 60, size.current.height / 5, 4, "white", ctx.current);
		playerB.current = new Player(size.current.width - 100, size.current.height - 100, size.current.width / 60, size.current.height / 5, 4, "white", ctx.current);

		ball.current = new Ball(size.current.width / 2, size.current.height / 2, 10, "white", ctx.current!);

		socket.current.on("ball", (arg : string) => {
		ball.current!.update_pos(JSON.parse(arg).current)});
		socket.current.on("playerA", (arg : string) => {
		playerA.current!.update_pos(JSON.parse(arg).current)});
		socket.current.on("playerB", (arg : string) => {
		playerB.current!.update_pos(JSON.parse(arg).current);});


		kd.current.W.down(function()
		{
			playerA.current!.moveUp();
			socket.current.emit("playerA", playerA);
		});

		kd.current.S.down(function()
		{
			playerA.current!.moveDown();
			socket.current.emit("playerA", playerA);
		})

		kd.current.O.down(function()
		{
			playerB.current!.moveUp();
			socket.current.emit("playerB", playerB);
		});

		kd.current.L.down(function()
		{
			playerB.current!.moveDown();
			socket.current.emit("playerB", playerB);
		})

		kd.current.run(function () {
				kd.current.tick();
		});

		return () => { window.cancelAnimationFrame(animationFrameId.current) }

	}, []);

	return (<center><canvas id="canvas" style={{marginTop: 150}} width={size.current.width} height={size.current.height} ref={canvasRef}></canvas></center>);
}
