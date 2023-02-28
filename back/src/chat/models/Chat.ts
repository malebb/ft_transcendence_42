import { ChatRoom } from "./ChatRoom";
import { ChatRoomUser } from "./ChatRoomUser";

export interface Chat {
	
	roomId: string;
	room: ChatRoom;
	members: ChatRoomUser[];
}