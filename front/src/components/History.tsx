import { useEffect, useState, useRef } from 'react'
import { axiosToken } from '../api/axios'
import { AxiosInstance } from 'axios';
import { GamePlayed } from '../interfaces/GamePlayed';
import { AchievementDone } from '../interfaces/AchievementDone';
import '../styles/history.css';

interface HistoryElem
{
	type: string;
	value: any;
}

const History = () => {
	const [sorted, setSorted] = useState<boolean>(false);
	const historyElem = useRef<HistoryElem[]>([]);
	const axiosInstance = useRef<AxiosInstance | null>(null);

	const trimUsername = (username: string) =>
	{
		return (username.length < 15 ? username : username.slice(0, 13) + '..');
	}

	const printHistory = () =>
	{
		if (sorted)
		{
			return (historyElem.current.map((elem) => {
			if (elem.type === "game")
			{
				return (<div className="historyElem" id="gamePlayed" key={elem.value.date}><h2>{trimUsername(elem.value.leftUsername)}</h2>
				<h2>{elem.value.leftScore} - {elem.value.rightScore}</h2> <h2>{trimUsername(elem.value.rightUsername)}</h2></div>);
			}
			else if (elem.type === "achievement")
			{
				return (<div className="historyElem" id="achievementDone"key={elem.value.date}><h2 className="title">{elem.value.title}</h2><h4 className="desc">{elem.value.desc}</h4></div>);
			}
			else
				return (<div>other</div>);
			}));
		}
		return (<div>Loading...</div>);
	}

	const compareElemDate = (elemA: any, elemB: any) =>
	{
		if (elemA.value.date > elemB.value.date)
		{
			return (-1);
		}
		if (elemA.value.date < elemB.value.date)
		{
			return (1);
		}
		return (0);
	}

	const initHistory = async () => {
		axiosInstance.current = await axiosToken();
		const username = (await axiosInstance.current.get('users/me', {})).data.email;
		axiosInstance.current = await axiosToken();
		const gamePlayed = (await axiosInstance.current.get('history/gamePlayed/' + username)).data.gamePlayed;
		axiosInstance.current = await axiosToken();
		const achievementDone = (await axiosInstance.current.get('history/achievementsDone/' + username)).data.achievementDone;
		for (let i = 0; i < gamePlayed.length; ++i)
		{
			historyElem.current.push({type: "game", value: gamePlayed[i]});
		}
		for (let i = 0; i < achievementDone.length; ++i)
		{
			historyElem.current.push({type: "achievement", value: achievementDone[i]});
		}
		historyElem.current.sort(compareElemDate);
		setSorted(true);
	};

	useEffect(() => {
		initHistory();
	}, []);
	return (
		<div id="history">{printHistory()}</div>
	);
}

export default History;
