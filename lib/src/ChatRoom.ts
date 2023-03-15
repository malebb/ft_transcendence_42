import { User } from './User';

export enum Accessibility {
	PUBLIC = "PUBLIC",
	PRIVATE = "PRIVATE",
	PROTECTED = "PROTECTED",
}

export enum PenaltyType {
	BAN = "BAN",
	MUTE = "MUTE",
}

export interface ChatRoom
{
	owner: User;
	name: string;
	password: string;
	accessibility: Accessibility;
}
