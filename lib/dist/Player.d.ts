import { Size } from './Size';
export declare class Player {
    posX: number;
    posY: number;
    width: number;
    height: number;
    vel: number;
    color: string;
    readonly position: string;
    ctx: CanvasRenderingContext2D | null;
    private canvasSize;
    score: number;
    constructor(posX: number, posY: number, width: number, height: number, vel: number, color: string, position: string, ctx: CanvasRenderingContext2D | null, canvasSize: Size | null);
    draw_paddle(): void;
    draw_score(): void;
    move(key: string): void;
    update_pos(player: Player): void;
    updateScore(scoreUpdated: number): void;
    setCtx(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Player.d.ts.map