import React from 'react';
import { useState, useRef, useEffect} from 'react';
import { axiosToken } from '../api/axios';
import Game from '../interfaces/Game';
import { Link, useParams } from "react-router-dom";

const Games = () => {
	const [gamesList, setGamesList] = useState<Game[]>([]);
	const {gameId} = useParams();
	
	const initGames = async () =>
	{
		const axiosInstance = axiosToken();
		setGamesList((await axiosInstance.get('/game')).data);
	}

	const printGames = () =>
	{
		return (gamesList.map(game => <Link to={`/games/${game.gameId}`} key={game.gameId}>{game.gameId}</Link>));
	}

	useEffect(() => {
			initGames();
	}, []);

	if (!gameId)
	{
		return (
			<div>
				<div>Games</div>
				<div>{printGames()}</div>
			</div>
		);
	}
	else
		return (
			<div>
				<p>{gameId}</p>
			</div>
		);

}

export default Games;
