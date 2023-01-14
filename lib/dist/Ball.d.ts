import { Player } from './Player';
import { Size } from './Size';
export declare class Ball {
    posX: number;
    private posY;
    private radius;
    color: string;
    private ctx;
    private readonly canvasSize;
    velX: number;
    velY: number;
    constructor(posX: number, posY: number, radius: number, color: string, ctx: CanvasRenderingContext2D | null, canvasSize: Size | null);
    draw(): void;
    playerCollision(players: (Player | null)[]): boolean;
    move(players: (Player | null)[]): string;
    update_pos(ball_properties: any): void;
    setCtx(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Ball.d.ts.map