"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(posX, posY, width, height, vel, color, position, ctx, canvasSize) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.vel = vel;
        this.color = color;
        this.position = position;
        this.ctx = ctx;
        this.canvasSize = canvasSize;
        this.score = 0;
    }
    draw_paddle() {
        var _a, _b;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.beginPath();
        this.ctx.fillStyle = this.color;
        (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.fillRect(this.posX, this.posY, this.width, this.height);
    }
    draw_score() {
        var _a, _b, _c;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.beginPath();
        this.ctx.fillStyle = "white";
        this.ctx.font = "70px Arial";
        if (this.position == "left")
            (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.fillText(this.score.toString(), this.canvasSize.width / 3, this.canvasSize.height / 4);
        else
            (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.fillText(this.score.toString(), this.canvasSize.width - (this.canvasSize.width / 3) - 30, this.canvasSize.height / 4);
    }
    move(key) {
        if (key == "UP") {
            if (this.posY - this.vel >= 0 && this.posY - this.vel <= this.canvasSize.height)
                this.posY -= this.vel;
        }
        else if (key == "DOWN") {
            if (this.posY + this.vel <= this.canvasSize.height - this.height)
                this.posY += this.vel;
        }
    }
    update_pos(player) {
        this.posX = player.posX;
        this.posY = player.posY;
    }
    updateScore(scoreUpdated) {
        this.score = scoreUpdated;
    }
    setCtx(ctx) {
        this.ctx = ctx;
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map