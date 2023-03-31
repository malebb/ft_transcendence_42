import { useEffect, useState, useRef, useContext } from "react";
import { AxiosInstance, AxiosResponse } from "axios";
import "../../styles/history.css";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Headers";
import { trimUsername } from "src/utils/trim";
import useAxiosPrivate from "src/hooks/usePrivate";
interface HistoryElem
{
	type: string;
	value: any;
}

const History = () =>
{

	const axiosPrivate = useAxiosPrivate();
	const [sorted, setSorted] = useState<boolean>(false);
	const historyElem = useRef<HistoryElem[]>([]);
	// const axiosInstance = useRef<AxiosInstance | null>(null);

	const printHistory = () =>
	{
		if (sorted)
		{
			if (!historyElem.current.length)
				return (<p id="noActivity">No activity yet</p>);
			return (historyElem.current.map((elem) => {
			if (elem.type === "game")
			{
				return (<div className="historyElem" id="gamePlayed" key={elem.value.date}>
							<div className="gameDataContainer">
								<p className="leftPlayer">{trimUsername(elem.value.leftPlayer.username, 15)}</p>
								<p className="score">{elem.value.leftScore} - {elem.value.rightScore}</p>
								<p className="rightPlayer">{trimUsername(elem.value.rightPlayer.username, 15)}</p>
							</div>
						</div>);
			}
			else if (elem.type === "achievement")
			{
				return (<div className="historyElem" id="achievementDone"key={elem.value.date}>
							<h4 className="title">{elem.value.title}</h4>
							<p className="desc">{elem.value.desc}</p>
						</div>);
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


	useEffect(() => {
		const initHistory = async () => {
			try
			{
				const gamePlayed: AxiosResponse = await axiosPrivate.get('history/gamePlayed');
				const achievementDone: AxiosResponse = await axiosPrivate.get('history/achievementsDone');
				for (let i = 0; i < gamePlayed.data.gamePlayed.length; ++i)
				{
					historyElem.current.push({type: "game", value: gamePlayed.data.gamePlayed[i]});
				}
				for (let i = 0; i < achievementDone.data.achievementDone.length; ++i)
				{
					historyElem.current.push({type: "achievement", value: achievementDone.data.achievementDone[i]});
				}
				historyElem.current.sort(compareElemDate);
				setSorted(true);
			}
			catch (error: any)
			{
				console.log('error (init history) : ', error);
			}
		};
		initHistory();
	}, []);
	return (
	<>
        <Headers/>
        <Sidebar/>
		<div id="history">
		{printHistory()}
		</div>
	</>
	);
}

export default History;
