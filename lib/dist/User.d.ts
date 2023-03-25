import { Message } from "./Message";
export interface User {
    id: number;
    email: string;
    username: string;
    profilePicture: string;
    messages?: Message[];
}
export declare enum Activity {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    IN_GAME = "IN_GAME"
}
