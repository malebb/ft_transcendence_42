export default class Player
{
	score : number = 0;

	constructor(public posX: number, public posY: number, public width: number,
	public height: number, public vel: number, public color: string, public readonly position : string, public readonly ctx : CanvasRenderingContext2D | null)
	{
	}

	draw_paddle()
	{
		this.ctx?.beginPath();
		this.ctx!.fillStyle = this.color;
		this.ctx?.fillRect(this.posX, this.posY, this.width, this.height);
	}

	draw_score()
	{
		this.ctx?.beginPath();
		this.ctx!.fillStyle = "white";
		this.ctx!.font = "70px Arial";
		if (this.position == "left")
			this.ctx?.fillText(this.score.toString(), this.ctx!.canvas.width / 3, this.ctx!.canvas.height / 4);
		else
			this.ctx?.fillText(this.score.toString(), this.ctx!.canvas.width - (this.ctx!.canvas.width / 3) - 30, this.ctx!.canvas.height / 4);
			
	}

	moveUp()
	{
		if (this.posY - this.vel >= 0 && this.posY - this.vel <= this.ctx!.canvas.height)
		{
			this.posY -= this.vel;
		}
	}

	moveDown()
	{
		if (this.posY + this.vel <= this.ctx!.canvas.height - this.height)
			this.posY += this.vel;
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
}
