import { User } from "@prisma/client";
//import { ChatRoom } from "./ChatRoom";

export interface Message {

	userId: string;
	user: User;
//	room: ChatRoom;
	message: string;
	sendAt: Date;
}
