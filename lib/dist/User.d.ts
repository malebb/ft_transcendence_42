export interface User {
    id: number;
    email: string;
    username: string;
    profilePicture: string;
}
export declare enum Activity {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    IN_GAME = "IN_GAME"
}
