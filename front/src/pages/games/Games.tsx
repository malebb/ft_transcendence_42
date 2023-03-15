import { Ball, Player } from "ft_transcendence";
import { io, Socket } from "socket.io-client";
import { useState, useRef, useEffect } from "react";
import { axiosToken } from "../../api/axios";
import { AxiosInstance, AxiosResponse } from "axios";
import Game from "../../interfaces/Game";
import { Link, useParams } from "react-router-dom";
import Draw from "../../classes/Draw";
import "../../styles/Games.css";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Headers";
import { trimUsername } from "src/utils/trim";

const Games = () =>
{
	const ctx = useRef<CanvasRenderingContext2D | null>(null);
	const [gamesList, setGamesList] = useState<Game[]>([]);
	const { gameId } = useParams();
	const size = useRef({ width: 700, height: 450 });
	const canvasRef = useRef(document.createElement("canvas"));
	const socket = useRef<Socket | null>(null);
	const leftPlayer = useRef<Player | null>(null);
	const rightPlayer = useRef<Player | null>(null);
	const ball = useRef<Ball>();
	const draw = useRef<Draw | null>(null);
	const map = useRef<HTMLImageElement | null>(null);
	const speedPowerUp = useRef<HTMLImageElement | null>(null);
	const animationFrameId = useRef<number>(0);
	const axiosInstance = useRef<AxiosInstance | null>(null);

	const printGames = () => {
		if (!gamesList.length)
		return (
			<p id="noGame">No game to spectate</p>
		);
		return (gamesList.map(game => {
			return (
				<Link className="gameLink" to={`/games/${game.gameId}`} key={game.id} >
					<div className="game">
						<p>{trimUsername(game.leftPlayer.username, 15)} &nbsp;&nbsp; vs &nbsp;&nbsp; {trimUsername(game.rightPlayer.username, 15)}</p>
					</div>
				</Link>
			);
		}));
	}

	useEffect(() => {
		const render = () =>
		{
			draw.current!.gameMap(map.current!);
			leftPlayer.current!.draw_paddle();
			rightPlayer.current!.draw_paddle();
			draw.current!.score(leftPlayer.current!.score, rightPlayer.current!.score);
			draw.current!.usernames(trimUsername(leftPlayer.current!.username, 15), trimUsername(rightPlayer.current!.username, 15));
			draw.current!.speedPowerUp(speedPowerUp.current!, leftPlayer.current!.speedPowerUp, rightPlayer.current!.speedPowerUp);
			ball.current?.draw();
			animationFrameId.current = window.requestAnimationFrame(render)
		}

		async function launchGame()
		{
			socket.current!.on("moveBall", (arg: string) => {
				ball.current!.update_pos(JSON.parse(arg))
			});

			socket.current!.on("movePlayer", (arg: string) => {
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
				const background = new Image();
				window.cancelAnimationFrame(animationFrameId.current)
				socket.current!.disconnect();

				background.onload = function() {
					draw.current!.outGameBackground(background);
					draw.current!.spectatorEnd();
				};
				background.src = '../images/purple.png';
			});

			socket.current!.on("endGame", () => {
				const background = new Image();

				window.cancelAnimationFrame(animationFrameId.current)
				socket.current!.disconnect();
				background.onload = function() {
					draw.current!.outGameBackground(background);
					draw.current!.spectatorEnd();
				};
				background.src = '../images/purple.png';
			});
			socket.current!.on("updateSpeedPowerUp", (status: boolean, position: string) => {
				if (position === "left")
					leftPlayer.current!.speedPowerUp = status;
				else if (position === "right")
					rightPlayer.current!.speedPowerUp = status;
			});

			map.current = new Image();
			speedPowerUp.current = new Image();
				map.current!.onload = function()
				{
					speedPowerUp.current!.onload = function()
					{
						render();
					}
					speedPowerUp.current!.src = '../images/speedPowerUp.png';
				}
				map.current!.src = '../images/basic.png';
		}

		const initSocket = async () => {
			socket.current = io(`ws://localhost:3333/pong`,
				{
					transports: ["websocket"],
					query: {
						challenge: false,
						spectator: true,
						roomId: gameId
					}
				});

			function spectateRoom(): Promise<string> {
				return (new Promise(resolve => {
					socket.current!.on(socket.current!.id, (data) => {
						resolve(data);
					});
				}));
			}

			socket.current!.on("connect", async () => {
				let joined: boolean = false;

				await spectateRoom().then(data => {
					if (JSON.parse(data).joined === false) {
						const background = new Image();

						window.cancelAnimationFrame(animationFrameId.current)
						socket.current!.disconnect();
						background.onload = function() {
							draw.current!.outGameBackground(background);
							draw.current!.spectatorEnd();
						};
						background.src = '../images/purple.png';
					}
					else {
						leftPlayer.current = Object.assign(new Player(0, 0, 0, 0, 0, "", "", "", 0, null, null), JSON.parse(data).leftPlayer);
						rightPlayer.current = Object.assign(new Player(0, 0, 0, 0, 0, "", "", "", 0, null, null), JSON.parse(data).rightPlayer);
						ball.current = Object.assign(new Ball(0, 0, 0, "white", 0, null, null), JSON.parse(data).ball);

						leftPlayer.current!.setCtx(ctx.current!);
						rightPlayer.current!.setCtx(ctx.current!);
						ball.current!.setCtx(ctx.current!);
						joined = true;
					}
				});
				if (joined)
					await launchGame();
			});
		}

		const initGames = async () => {
			try
			{
				if (gameId)
				{
					ctx.current = canvasRef.current.getContext("2d");
					draw.current = new Draw(ctx.current);
	
					let googleFont = draw.current!.initFont();
					document.fonts.add(googleFont);
					googleFont.load().then(() =>
					{
						initSocket();
					});
				}
				else {
					axiosInstance.current = await axiosToken();
					const games: AxiosResponse = await axiosInstance.current.get('/game');
					setGamesList(games.data);
				}
			}
			catch (error: any)
			{
				console.log('error (init games) : ', error);
			}
		}

		async function spectate()
		{
			initGames();
		}
		spectate();
		return () => {
			if (socket.current != null) {
				window.cancelAnimationFrame(animationFrameId.current)
				socket.current!.disconnect();
			}
		}
	}, [gameId]);

	if (!gameId) {
		return (
		<>
				<Headers />
				<Sidebar />
			<div id="games">
				{printGames()}
			</div>
		</>	
		);
	}
	else
		return (
		<>
			<Headers />
			<Sidebar />
			<div id="spectate">
				<h3 id="spectatorTitle">Spectator mode</h3>
				<canvas id="canvas" width={size.current.width} height={size.current.height} ref={canvasRef}></canvas>
			</div>
		</>
		);

}

export default Games;