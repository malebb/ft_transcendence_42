import { Player } from './Player';
import { Size } from './Size';

export class Ball
{
	initialSpeed = 0;
	velX = this.speed / 2;
	velY = this.speed / 2;

	constructor(public posX: number, private posY: number, private radius: number,
	public color: string, public speed: number, private ctx: CanvasRenderingContext2D | null, private readonly canvasSize: Size | null)
	{
		this.initialSpeed = speed;
	}

	draw()
	{
		this.ctx!.beginPath();
		this.ctx!.fillStyle = this.color;
		this.ctx!.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
		this.ctx!.fill();
	}

	bounceOff(player: Player)
	{
		const maxDegreeBounceAngle = 40;
		const relativeIntersectY: number = (player.posY + (player.height / 2)) - (this.posY);
		const normalizedRelativeIntersectY: number = (relativeIntersectY / (player.height / 2));
		const bounceAngle = normalizedRelativeIntersectY * (maxDegreeBounceAngle* Math.PI / 180)

		this.velX = this.speed * Math.cos(bounceAngle);
		this.velY = this.speed * -1 * Math.sin(bounceAngle);
		if (this.velX < 0 && player.position === "left" || this.velX > 0 && player.position == "right")
			this.velX *= -1;
	}

	playerCollision(players: (Player | null)[])
	{
		for (let i = 0; i < players.length; i++)
		{
			// check collision X
			if (this.posX >= players[i]!.posX - this.radius
				&& this.posX <= players[i]!.posX + players[i]!.width + this.radius)
			{
				// check collision Y
				if (this.posY >= players[i]!.posY - this.radius
					&& this.posY <= players[i]!.posY + players[i]!.height + this.radius)
				{
					this.bounceOff(players[i]!);
					return (true);
				}
			}
		}
		return (false);
	}

	randomNb(max: number)
	{
		return (Math.floor(Math.random() * max));
	}

	move(players : (Player | null)[]) : string
	{
		let scorer : string = "";

		if (!this.playerCollision(players))
		{
			if (this.posX >= this.canvasSize!.width - this.radius || this.posX <= this.radius)
			{
				if (this.velX > 0)
				{
					players[0]!.score++;
					scorer = "left";
					this.velX = this.speed / 2;
				}
				else
				{
					players[1]!.score++;
					scorer = "right";
					this.velX = -(this.speed / 2);
				}
				this.velY = this.speed / 2;
				if (this.randomNb(2))
					this.velY *= -1;
				this.velX *= -1;
				this.posX = this.canvasSize!.width / 2;
				this.posY = this.canvasSize!.height / 2;
			}
			if (this.posY >= this.canvasSize!.height - this.radius
				|| this.posY <= this.radius)
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

	speedPowerUp()
	{
		this.velX *= 1.5;
		this.velY *= 1.5;
	}
}
