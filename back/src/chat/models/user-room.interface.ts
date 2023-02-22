import { User } from "@prisma/client";
import { Room } from "./room.interface";

export interface UserRoom {

	roomId: string;
	room: Room;
	user: User;
	isAdmin: boolean;
}