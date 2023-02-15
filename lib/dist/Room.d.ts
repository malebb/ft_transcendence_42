import { Ball } from "./Ball";
import { Player } from "./Player";
export interface Room {
    id: string;
    playerGoneCount: number;
    ball: Ball;
    leftPlayer: Player;
    rightPlayer: Player;
    speedPowerUpInterval: ReturnType<typeof setTimeout>;
    roomInterval: ReturnType<typeof setInterval>;
    powerUpMode: boolean;
}
