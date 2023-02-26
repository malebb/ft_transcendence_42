import { useParams } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import { AxiosInstance } from 'axios';
import { axiosToken } from '../api/axios'
import StatsData from '../interfaces/StatsData';
import { AchievementsData, modeExplorer,
fashionWeek, traveler, failureKnowledge,
winSteps, levelSteps} from 'ft_transcendence';
import '../styles/Achievements.css';

const Achievements = () =>
{
	const axiosInstance = useRef<AxiosInstance | null>(null);
    const { userId } = useParams();
	const [stats, setStats] = useState<StatsData | null>(null);
	const winAchievements  = useRef<string[]>([]);
	const levelAchievements  = useRef<string[]>([]);
	const defeatAchievements  = useRef<string[]>([]);


	function printStatus(achievement: AchievementsData)
	{
		const achievementDone = <img width="58px" src="http://localhost:3000/images/achievementDone.png"/>
		const achievementToDo = <img width="50px" src="http://localhost:3000/images/achievementToDo.png"/>

		if (achievement.title == "Mode explorer")
			return (stats!.modeExplorer ? achievementDone : achievementToDo);
		else if (achievement.title == "Fashion week")
			return (stats!.fashionWeek ? achievementDone : achievementToDo);
		else if (achievement.title == "Traveler")
			return (stats!.traveler ? achievementDone : achievementToDo);
		else if (winAchievements.current.includes(achievement.title))
			return (stats!.victory < achievement.goal! ? achievementToDo : achievementDone); 
		else if (levelAchievements.current.includes(achievement.title))
			return (stats!.level < achievement.goal! ? achievementToDo : achievementDone); 
		else if (defeatAchievements.current.includes(achievement.title))
			return (stats!.defeat < achievement.goal! ? achievementToDo : achievementDone); 
	}

	function oneStepAchievements()
	{
		let oneStepAchievements: AchievementsData[] = [];

		oneStepAchievements.push(modeExplorer);
		oneStepAchievements.push(fashionWeek);
		oneStepAchievements.push(traveler);
		if (stats)
		{
			return (
				oneStepAchievements.map((achievement) => {
					return (
						<div className="achievement" key={achievement.title}>
							<h3>{achievement.title}</h3>
							<p>{achievement.desc}</p>
							{printStatus(achievement)}
						</div>);
				}));
		}
		return (<p>loading...</p>);
	}

	function printProgress(achievement: AchievementsData)
	{
		if (winAchievements.current.includes(achievement.title))
			return (<p>{stats!.victory <= achievement.goal! ? stats!.victory : achievement.goal!} / {achievement.goal}</p>); 
		if (levelAchievements.current.includes(achievement.title))
			return (<p>{stats!.level <= achievement.goal! ? stats!.level : achievement.goal!} / {achievement.goal}</p>); 
		if (defeatAchievements.current.includes(achievement.title))
			return (<p>{stats!.defeat<= achievement.goal! ? stats!.defeat : achievement.goal!} / {achievement.goal}</p>); 
		return (<p>loading...</p>);
	}

	function severalStepsAchievements()
	{
		let severalStepsAchievements: AchievementsData[] = [];

		severalStepsAchievements = severalStepsAchievements.concat(winSteps);
		severalStepsAchievements = severalStepsAchievements.concat(levelSteps);
		severalStepsAchievements.push(failureKnowledge);
		if (stats)
		{
			return (
				severalStepsAchievements.map((achievement) => {
					return (
						<div className="achievement" key={achievement.title}>
							<h3>{achievement.title}</h3>
							<p>{achievement.desc}</p>
							{printProgress(achievement)}
							{printStatus(achievement)}
						</div>);
				}));
		}
		return (<p>loading...</p>);
	}
	
	function initAchievementNames()
	{
		winSteps.forEach(winStep => {
			winAchievements.current.push(winStep.title);
		});
		levelSteps.forEach(levelStep => {
			levelAchievements.current.push(levelStep.title);
		});
		defeatAchievements.current.push(failureKnowledge.title);
	}

	useEffect(() =>
	{
		initAchievementNames();
		const initAchievements = async () =>
		{
			axiosInstance.current = await axiosToken();
			const username = (await axiosInstance.current.get('users/profile/' + userId, {})).data.username;
			setStats((await axiosInstance.current.get('/stats/' + username)).data);
		}
		initAchievements();

	}, []);
	return (
		<div>
			<h2 id="achievementsTitle">Achievements</h2>
			<div id="achievements">
				{oneStepAchievements()}
				{severalStepsAchievements()}
			</div>
		</div>
	);
}

export default Achievements;