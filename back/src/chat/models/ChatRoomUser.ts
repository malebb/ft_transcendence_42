import { User } from "@prisma/client";

export interface ChatRoomUser {

	roomId: string;
//	room: ChatRoom;
	user: User;
	isAdmin: boolean;
}
