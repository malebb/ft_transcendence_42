import { ChatRoomUser } from './ChatRoomUser';

export interface ChatRoom {
  roomId: string;
  admin: string;
  members: ChatRoomUser[];
  createdAt: Date;
}
