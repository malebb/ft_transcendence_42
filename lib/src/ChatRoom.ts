export enum Accessibility {
	PUBLIC = "PUBLIC",
	PRIVATE = "PRIVATE",
	PROTECTED = "PROTECTED",
}

export interface ChatRoom
{
	owner: string;
	name: string;
	password: string;
	accessibility: Accessibility;
}
