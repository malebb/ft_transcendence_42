export default class Player
{
	score : number = 0;

	constructor(public posX: number, public posY: number, public width: number,
	public height: number, public vel: number, public color: string, public readonly ctx : CanvasRenderingContext2D | null)
	{
		this.posX = posX;
		this.posY = posY
		this.width = width;
		this.height = height;
		this.vel = vel;
		this.color = color;
		this.ctx = ctx;
	}

	draw_paddle()
	{
		this.ctx?.beginPath();
		this.ctx!.fillStyle = this.color;
		this.ctx?.fillRect(this.posX, this.posY, this.width, this.height);
	}

	draw_score(posx : number, posy : number)
	{
		this.ctx?.beginPath();
		this.ctx!.fillStyle = "white";
		this.ctx!.font = "70px Arial";
		this.ctx?.fillText(this.score.toString(), posx, posy);
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

	update_pos(player_properties : any)
	{
		this.posX = player_properties.posX;
		this.posY = player_properties.posY;
	}

	updateScore(scoreUpdated: number)
	{
		this.score = scoreUpdated;
	}
}
