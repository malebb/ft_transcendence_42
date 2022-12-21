import Player from './Player'

export default class Ball
{
	velX = 3;
	velY = 3;

	constructor(private posX: number, private posY: number, private radius: number,
	private color: string, private ctx: CanvasRenderingContext2D )
	{
	}

	draw()
	{
		this.ctx.beginPath();
		this.ctx.fillStyle = this.color;
		this.ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
		this.ctx.fill();
	}
	
	playerCollision(players: (Player | null)[])
	{
		for (let i = 0; i < players.length; i++)
		{
			// check collision X
			if (((this.posX + this.velX) >= players[i]!.posX)
				&& ((this.posX + this.velX) <= (players[i]!.posX + players[i]!.width)))
			{
				// check collision Y
				if (((this.posY + this.velY) >= players[i]!.posY)
					&& ((this.posY + this.velY) <= (players[i]!.posY + players[i]!.height)))
				{
					if (i === 0 && this.velX < 0)
						this.velX *= -1;
					else if (i === 1 && this.velX > 0)
						this.velX *= -1;

					if (this.posY + this.velY < players[i]!.posY + players[i]!.height / 2)
					{
						if (this.velY > 0)
							this.velY *= -1;
					}
					else
					{
						if (this.velY < 0)
							this.velY *= -1;
					}
					return (true);
				}
			}
		}
		return (false);
	}

	move(players : (Player | null)[])
	{
		if (!this.playerCollision(players))
		{
			if (this.posX + this.velX >= this.ctx.canvas.width - this.radius || this.posX + this.velX <= this.radius)
			{
				if (this.velX > 0)
					players[0]!.score++;
				else
					players[1]!.score++;
				this.velX *= -1;
				this.posX = this.ctx.canvas.width / 2;
			}
			if (this.posY + this.velY >= this.ctx.canvas.height - this.radius
				|| this.posY + this.velY <= this.radius)
				this.velY *= -1;
		}
		this.posX += this.velX;
		this.posY += this.velY;
	}
}
