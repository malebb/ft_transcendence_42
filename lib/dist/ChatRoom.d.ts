import { User } from './User';
export declare enum Accessibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    PROTECTED = "PROTECTED",
    PRIVATE_PROTECTED = "PRIVATE_PROTECTED"
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
export interface Penalty {
    id: number;
    date: string;
    author: User;
    target: User;
    type: PenaltyType;
    durationInMin: number;
}
export declare const PenaltyTimes: number[];
