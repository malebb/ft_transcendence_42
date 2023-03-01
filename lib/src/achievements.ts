

export interface AchievementsData {
	title: string;
	desc: string;
	goal: number | null;
}

export const winSteps: AchievementsData[] = [
	{title: "Baby winner", desc: "Win 5 games", goal: 5},
	{title: "Teenage winner", desc: "Win 15 games", goal: 15},
	{title: "Adult winner", desc: "Win 30 games", goal: 30},
	{title: "Superhero winner", desc: "Win 50 games", goal: 50},
	{title: "Boss winner", desc: "Win 100 games", goal: 100}
];

export const levelSteps: AchievementsData[] = [
	{title: "Ant step", desc: "Reach level 1", goal: 1},
	{title: "Mouse step", desc: "Reach level 2", goal: 2},
	{title: "Dog step", desc: "Reach level 3", goal: 3},
	{title: "Human step", desc: "Reach level 4", goal: 4},
	{title: "Giant step", desc: "Reach level 5", goal: 5},
	{title: "Dinosaur step", desc: "Reach level 6", goal: 6}
];

export const modeExplorer: AchievementsData = {title: "Mode explorer", desc: "Try the power-up mode", goal: null};

export const fashionWeek: AchievementsData = {title: "Fashion week", desc: "Finish a game with a custom skin", goal: null}

export const traveler: AchievementsData = {title: "Traveler", desc: "Finish a game with a custom map", goal: null}

export const failureKnowledge: AchievementsData = {title: "Failure knowledge", desc: "Lose 20 games", goal: 20}

