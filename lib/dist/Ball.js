"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
class Ball {
    constructor(posX, posY, radius, color, speed, ctx, canvasSize) {
        this.posX = posX;
        this.posY = posY;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.ctx = ctx;
        this.canvasSize = canvasSize;
        this.initialSpeed = 0;
        this.velX = this.speed / 2;
        this.velY = this.speed / 2;
        this.initialSpeed = speed;
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    bounceOff(player) {
        const maxDegreeBounceAngle = 75;
        const relativeIntersectY = (player.posY + (player.height / 2)) - (this.posY + this.speed);
        const normalizedRelativeIntersectY = (relativeIntersectY / (player.height / 2));
        const bounceAngle = normalizedRelativeIntersectY * (maxDegreeBounceAngle * Math.PI / 180);
        this.velX = this.speed * Math.cos(bounceAngle);
        this.velY = this.speed * -1 * Math.sin(bounceAngle);
        if (this.velX < 0 && player.position === "left" || this.velX > 0 && player.position == "right")
            this.velX *= -1;
    }
    playerCollision(players) {
        for (let i = 0; i < players.length; i++) {
            // check collision X
            if (this.posX + this.speed >= players[i].posX
                && this.posX + this.speed <= players[i].posX + players[i].width + this.radius) {
                // check collision Y
                if (this.posY + this.speed >= players[i].posY
                    && this.posY + this.speed <= players[i].posY + players[i].height) {
                    this.bounceOff(players[i]);
                    return (true);
                }
            }
        }
        return (false);
    }
    randomNb(max) {
        return (Math.floor(Math.random() * max));
    }
    move(players) {
        let scorer = "";
        if (!this.playerCollision(players)) {
            if (this.posX + this.speed >= this.canvasSize.width - this.radius || this.posX + this.speed <= this.radius) {
                if (this.velX > 0) {
                    players[0].score++;
                    scorer = "left";
                    this.velX = this.speed / 2;
                }
                else {
                    players[1].score++;
                    scorer = "right";
                    this.velX = -(this.speed / 2);
                }
                this.velY = this.speed / 2;
                if (this.randomNb(2))
                    this.velY *= -1;
                this.velX *= -1;
                this.posX = this.canvasSize.width / 2;
                this.posY = this.canvasSize.height / 2;
            }
            if (this.posY + this.speed >= this.canvasSize.height - this.radius
                || this.posY + this.speed <= this.radius)
                this.velY *= -1;
        }
        this.posX += this.velX;
        this.posY += this.velY;
        return (scorer);
    }
    update_pos(ball_properties) {
        this.posX = ball_properties.posX;
        this.posY = ball_properties.posY;
        this.velX = ball_properties.velX;
        this.velY = ball_properties.velY;
    }
    setCtx(ctx) {
        this.ctx = ctx;
    }
    speedPowerUp() {
        this.velX *= 1.5;
        this.velY *= 1.5;
    }
}
exports.Ball = Ball;
//# sourceMappingURL=Ball.js.map