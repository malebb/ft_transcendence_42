import { useEffect } from 'react'
import { axiosToken } from '../api/axios'

const History = () => {	

	const initHistory = async () => {
		const axiosInstance = axiosToken();
		const username = (await axiosInstance.get('users/me', {})).data.email;
	const gamesPlayed = await axiosInstance.get('history/gamePlayed/' + username);
	let date = gamesPlayed.data.gamePlayed[1].playedAt;
	let jsDate = new Date(date);
	console.log("date js = ", jsDate);
	};

	useEffect(() => {
		initHistory();
	}, []);
	return (
		<div>History</div>
	);
}

export default History;
