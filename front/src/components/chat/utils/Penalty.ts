import { User, PenaltyType } from 'ft_transcendence';

export interface Penalty
{
	id: number;
	date: string;
	author: User;
	target: User;
	type: PenaltyType;
}
