import { Message } from "./Message";

export interface User
{
	id: number;
	email: string;
	username: string;
	profilePicture: string;
	messages: Message[];
}
