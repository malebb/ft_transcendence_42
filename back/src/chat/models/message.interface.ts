import { User } from "@prisma/client";
import { Room } from "./room.interface";

export interface Message {

	userId: string;
	user: User;
	room: Room;
	message: string;
	sendAt: Date;
}