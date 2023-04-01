import { User } from './User';
import { Message } from './Message';
export interface PrivateMessage {
    sender: User;
    receiver: User;
    message: Message;
}
