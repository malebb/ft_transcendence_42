import { Size } from './Size'

export class Player
{
	score: number = 0;
	margin: number = 15;
	speedPowerUp: boolean = false;

	constructor(public posX: number, public posY: number, public width: number,
	public height: number, public vel: number, public skin: string, public readonly position: string,
	public username: string, public id: number, public ctx: CanvasRenderingContext2D | null, private canvasSize: Size | null)
	{
	}

	draw_paddle()
	{
		this.ctx?.beginPath();
		this.ctx!.fillStyle = this.skin;
		this.ctx?.fillRect(this.posX, this.posY, this.width, this.height);
	}

	draw_score()
	{
		this.ctx?.beginPath();
		this.ctx!.fillStyle = "white";
		this.ctx!.font = "70px Arial";
		if (this.position == "left")
			this.ctx?.fillText(this.score.toString(), this.canvasSize!.width / 3, this.canvasSize!.height / 4);
		else
			this.ctx?.fillText(this.score.toString(), this.canvasSize!.width - (this.canvasSize!.width / 3) - 30, this.canvasSize!.height / 4);
			
	}

	move(key: string)
	{
		if (key == "UP")
		{
			if (this.posY - this.vel >= 0 + this.margin)
				this.posY -= this.vel;
		}
		else if (key == "DOWN")
		{
			if (this.posY + this.vel <= this.canvasSize!.height - (this.height + this.margin))
				this.posY += this.vel;
		}
	}

	update_pos(player : Player)
	{
		this.posX = player.posX;
		this.posY = player.posY;
	}

	updateScore(scoreUpdated: number)
	{
		this.score = scoreUpdated;
	}
	
	setCtx(ctx: CanvasRenderingContext2D)
	{
		this.ctx = ctx;
	}
}
