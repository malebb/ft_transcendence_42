import { User } from './User';

export enum Accessibility {
	PUBLIC = "PUBLIC",
	PRIVATE = "PRIVATE",
	PROTECTED = "PROTECTED",
	PRIVATE_PROTECTED = "PRIVATE_PROTECTED"
}

export enum PenaltyType {
	BAN = "BAN",
	MUTE = "MUTE",
}

export interface ChatRoom
{
	owner: User;
	members: User[];
	name: string;
	password: string;
	accessibility: Accessibility;
}

export interface Penalty
{
	id: number;
	date: string;
	author: User;
	target: User;
	type: PenaltyType;
	durationInMin: number;
}

export const PenaltyTimes = [1, 15, 60, 360, 1440, 10080];
