import { User } from "@prisma/client";
import { ChatRoom } from "./ChatRoom";

export interface ChatRoomUser {

	roomId: string;
	room: ChatRoom;
	user: User;
	isAdmin: boolean;
}