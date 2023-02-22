import { Room } from "./room.interface";
import { UserRoom } from "./user-room.interface";

export interface Chat {
	
	roomId: string;
	room: Room;
	members: UserRoom[];
}