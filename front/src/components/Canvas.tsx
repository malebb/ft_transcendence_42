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
		ctx.current = canvasRef.current.getContext("2d");
		
		playerA.current = new Player(75, 100, size.current.width / 60, size.current.height / 5, 2, "white", ctx.current);
		playerB.current = new Player(size.current.width - 100, size.current.height - 100, size.current.width / 60, size.current.height / 5, 2, "white", ctx.current);

		ball.current = new Ball(size.current.width / 2, size.current.height / 2, 10, "white", ctx.current!);

		socket.current.on("ball", (arg : string) => {
		ball.current!.update_pos(JSON.parse(arg).current)});
		socket.current.on("playerA", (arg : string) => {
		playerA.current!.update_pos(JSON.parse(arg).current)});
		socket.current.on("playerB", (arg : string) => {
		playerB.current!.update_pos(JSON.parse(arg).current);});

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

		render();
		return () => { window.cancelAnimationFrame(animationFrameId.current) }

	}, []);

	return (<center><canvas style={{marginTop: 150}} width={size.current.width} height={size.current.height} ref={canvasRef}></canvas></center>);
}
