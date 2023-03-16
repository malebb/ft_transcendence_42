import { User } from './User';
import { ChatRoom } from './ChatRoom';
export interface Message {
    user: User;
    message: string;
    sendAt: Date;
    room?: ChatRoom;
}
