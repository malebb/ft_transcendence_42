import { User } from './User';
export declare enum Accessibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    PROTECTED = "PROTECTED"
}
export declare enum PenaltyType {
    BAN = "BAN",
    MUTE = "MUTE"
}
export interface ChatRoom {
    owner: User;
    members: User[];
    name: string;
    password: string;
    accessibility: Accessibility;
}
