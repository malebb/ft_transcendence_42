import { Player } from './Player';
import { Size } from './Size';

export class Ball
{
	velX = 3;
	velY = 3;

	constructor(public posX: number, private posY: number, private radius: number,
	public color: string, private ctx: CanvasRenderingContext2D | null, private readonly canvasSize: Size | null)
	{
	}

	draw()
	{
		this.ctx!.beginPath();
		this.ctx!.fillStyle = this.color;
		this.ctx!.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
		this.ctx!.fill();
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
					if (players[i]!.position == "left" && this.velX < 0)
						this.velX *= -1;
					else if (players[i]!.position == "right" && this.velX > 0)
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

	move(players : (Player | null)[]) : string
	{
		let scorer : string = "";

		if (!this.playerCollision(players))
		{
			if (this.posX + this.velX >= this.canvasSize!.width - this.radius || this.posX + this.velX <= this.radius)
			{
				if (this.velX > 0)
				{
					players[0]!.score++;
					scorer = "left";
				}
				else
				{
					players[1]!.score++;
					scorer = "right";
				}
				this.velX *= -1;
				this.posX = this.canvasSize!.width / 2;
			}
			if (this.posY + this.velY >= this.canvasSize!.height - this.radius
				|| this.posY + this.velY <= this.radius)
				this.velY *= -1;
		}
		this.posX += this.velX;
		this.posY += this.velY;
		return (scorer);
	}

	update_pos(ball_properties : any)
	{
		this.posX = ball_properties.posX;
		this.posY = ball_properties.posY;
		this.velX = ball_properties.velX;
		this.velY = ball_properties.velY;
	}

	setCtx(ctx: CanvasRenderingContext2D)
	{
		this.ctx = ctx;
	}
}
