import Skin from "../classes/Skin";

interface LinkZone{
	posX : number;
	posY : number;
	width : number;
	height : number;
}

export default class Draw
{
	skins : Skin[] = [];

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
			let	textZone : LinkZone| undefined;

			this.ctx!.beginPath();
			this.ctx!.fillStyle = "white";
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

	opponentDisconnectionPage()
	{
		this.ctx!.fillStyle = 'black';
		this.ctx!.fillRect(0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);
		this.text("Opponent's left", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35);
	}
	
	skinsBackground()
	{
		this.ctx!.fillStyle = 'black';
		this.ctx!.fillRect(0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);
		this.text("Skins", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 6, 35);
	}

	skin(name : string) : LinkZone
	{
		let margin : number = 100;
		let nbInRow : number = 5;
		let skin : Skin = new Skin(name, this.ctx!.canvas.width / 60, this.ctx!.canvas.height / nbInRow);
		let skinZone : LinkZone = {posX : (this.ctx!.canvas.width / nbInRow) * (this.skins!.length % nbInRow) + this.ctx!.canvas.width / (nbInRow * 2), posY : (skin.height * 2) * Math.floor(this.skins.length / nbInRow) + margin, width : skin.width, height : skin.height};

		this.ctx!.fillStyle = name;
		this.ctx!.fillRect(skinZone.posX, skinZone.posY, skinZone.width, skinZone.height);
		this.skins!.push(skin);
		return (skinZone);
	}

	map()
	{
		this.ctx!.fillStyle = 'black';
		this.ctx!.fillRect(0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);
		this.ctx!.beginPath();
		this.ctx!.fillStyle = 'white';
		this.ctx!.moveTo(this.ctx!.canvas.width / 2, 0);
		this.ctx!.lineTo(this.ctx!.canvas.width / 2, this.ctx!.canvas.height);
		this.ctx!.moveTo(0, 0);
		this.ctx!.lineTo(80, 80);
		this.ctx!.stroke();
	}

	mapsBackground()
	{
		this.ctx!.fillStyle = 'black';
		this.ctx!.fillRect(0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);
		this.text("Maps", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 6, 35);
	}
}
