import { UserRoom } from "./user-room.interface";

export interface Room {

	roomId: string;
	admin: string;
	members: UserRoom[];
}