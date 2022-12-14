
interface TextZone{
	posX : number;
	posY : number;
	width : number;
	height : number;
}

export default class Draw
{
	constructor(public readonly ctx : CanvasRenderingContext2D | null)
	{
	}

	menuBackground()
	{
		this.ctx!.fillStyle = 'black';
		this.ctx!.fillRect(0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);
	}
	
	getTextZone(text: string, posX : number, posY : number)
	{
			let	textzone : TextMetrics = this.ctx!.measureText(text);

			return ({posX : posX - textzone.actualBoundingBoxLeft, posY : posY - textzone.fontBoundingBoxAscent,
			height: textzone.fontBoundingBoxAscent + textzone.fontBoundingBoxDescent,
			width : textzone.width});
	}

	text(text : string, posX : number, posY : number, size : number)
	{
			let	textZone : TextZone | undefined;

			this.ctx!.beginPath();
			this.ctx!.fillStyle = "pink";
			this.ctx!.font = size + "px Courier New";
			this.ctx!.textAlign = 'center';
			this.ctx!.fillText(text, posX, posY);
			textZone = this.getTextZone(text, posX, posY);
			return (textZone);
	}

	matchmakingPage()
	{
		this.ctx!.fillStyle = 'black';
		this.ctx!.fillRect(0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);
		this.text("looking for player...", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35);
	}
	
	skinsPage()
	{
		this.ctx!.fillStyle = 'black';
		this.ctx!.fillRect(0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);
		this.text("Skins", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 5, 35);
	}
}
