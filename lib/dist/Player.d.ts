import { Size } from './Size';
export declare class Player {
    posX: number;
    posY: number;
    width: number;
    height: number;
    vel: number;
    skin: string;
    readonly position: string;
    username: string;
    ctx: CanvasRenderingContext2D | null;
    private canvasSize;
    score: number;
    margin: number;
    speedPowerUp: boolean;
    constructor(posX: number, posY: number, width: number, height: number, vel: number, skin: string, position: string, username: string, ctx: CanvasRenderingContext2D | null, canvasSize: Size | null);
    draw_paddle(): void;
    draw_score(): void;
    move(key: string): void;
    update_pos(player: Player): void;
    updateScore(scoreUpdated: number): void;
    setCtx(ctx: CanvasRenderingContext2D): void;
}
