import { Ball } from "./Ball";
import { Player } from "./Player";
export interface Room {
    id: string;
    running: boolean;
    ball: Ball;
    leftPlayer: Player;
    rightPlayer: Player;
    speedPowerUpInterval: ReturnType<typeof setTimeout>;
}
