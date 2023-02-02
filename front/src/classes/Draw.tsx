import Skin from "../classes/Skin";
import MapData from "../interfaces/MapData";
import LinkZone from '../interfaces/LinkZone'; 

export default class Draw
{
	skins : Skin[] = [];
	mapList = [{name: "basic", path: "./images/basic.png"},
			{name: "beach", path: "./images/beach.jpg"},
			{name: "city", path: "./images/city.jpg"},
			{name: "desert", path: "./images/desert.jpg"},
			{name: "lava", path: "./images/lava.jpg"},
			{name: "nature", path: "./images/nature.jpg"},
			{name: "snow", path: "./images/snow.jpg"},
			{name: "space", path: "./images/space.jpg"}];

	constructor(public readonly ctx : CanvasRenderingContext2D | null)
	{
	}

	initOutGameBackground() : HTMLImageElement
	{
		const img = new Image();

		img.src = './images/purple.png';
		return (img);
	}

	outGameBackground(background: HTMLImageElement)
	{
		this.ctx!.drawImage(background, 0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);
	}

	initGameMap(mapName: string) : HTMLImageElement
	{
		const img = new Image();

		this.mapList.forEach(map => {
			if (map.name === mapName)
				img.src = map.path;
		});
		return (img);
	}

	gameMap(map: HTMLImageElement)
	{
		this.ctx!.drawImage(map, 0, 0, this.ctx!.canvas.width, this.ctx!.canvas.height);

	}

	initSpeedPowerUp()
	{
		const img = new Image();

		img.src = './images/speedPowerUp.png';
		return (img);
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

	text(text : string, posX : number, posY : number, size : number, color: string, font: string)
	{
			let	textZone : LinkZone| undefined;

			this.ctx!.beginPath();
			this.ctx!.fillStyle = color;
			this.ctx!.font = size + "px " + font;
			this.ctx!.textAlign = 'center';
			this.ctx!.fillText(text, posX, posY);
			textZone = this.getTextZone(text, posX, posY);
			return (textZone);
	}

	matchmaking()
	{
		this.text("looking for player...", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, "black", "Courier New");
	}

	opponentDisconnection()
	{
		this.text("Opponent has left", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, "black", "Courier New");
	}
	
	skinsTitle()
	{
		this.text("Skins", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 6, 35, "black", "Courier New");
	}

	skin(name : string) : LinkZone
	{
		let margin : number = 100;
		let nbInRow : number = 5;
		let skin : Skin = new Skin(name, this.ctx!.canvas.width / 60, this.ctx!.canvas.height / nbInRow);
		let skinZone : LinkZone = {posX : (this.ctx!.canvas.width / nbInRow) * (this.skins.length % nbInRow) + this.ctx!.canvas.width / (nbInRow * 2), posY : (skin.height * 2) * Math.floor(this.skins.length / nbInRow) + margin, width : skin.width, height : skin.height};

		this.ctx!.fillStyle = name;
		this.ctx!.fillRect(skinZone.posX, skinZone.posY, skinZone.width, skinZone.height);
		this.skins.push(skin);
		return (skinZone);
	}

	mapsTitle()
	{
		this.text("Maps", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 6, 35, "black", "Courier New");
	}

	map(): LinkZone[]
	{
		let margin : number = 100;
		let nbInRow : number = 4;
		let width = this.ctx!.canvas.width / 6;
		let height = this.ctx!.canvas.height / 5;
		const ctx: CanvasRenderingContext2D = this.ctx!;
		let loaded: number = 0;

		let maps: MapData[] = [];
 		let mapZones: LinkZone[] = [];

		let loadImg = () =>
		{
			loaded++;
			if (loaded === this.mapList.length)
			{
				maps.forEach((map) => {

					ctx!.drawImage(map.mapImg, map.mapZone.posX, map.mapZone.posY, map.mapZone.width, map.mapZone.height);
				})
			}
		}

		this.mapList.forEach((map) =>
		{
			const mapImg: HTMLImageElement = new Image();

			mapImg.onload = loadImg;
			let mapData: MapData =
			{
				mapImg: mapImg,
				mapZone: {posX: ((this.ctx!.canvas.width / nbInRow) * (maps.length % nbInRow)
					+ this.ctx!.canvas.width / (nbInRow * 2)) - width / 2,
					posY: (height * 2) * Math.floor(maps.length / nbInRow) + margin,
					width: width,
					height: height}
			}
			maps.push(mapData)
			mapZones.push(mapData.mapZone);
			mapImg.src = map.path;
		});
		return (mapZones);
	}

	youWon()
	{
		this.text("You won!", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, "black", "Courier New");
	}

	youLost()
	{
		this.text("You lost!", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, "black", "Courier New");
	}

	score(scoreLeft: number, scoreRight: number)
	{
		this.text(scoreLeft.toString(), this.ctx!.canvas.width / 3.03, this.ctx!.canvas.height / 5, 55, "white", "Verdana");
		this.text(scoreRight.toString(), this.ctx!.canvas.width / 1.51, this.ctx!.canvas.height / 5, 55, "white", "Verdana");
	}

	speedPowerUp(logo: HTMLImageElement, leftSpeedPowerUp: boolean, rightSpeedPowerUp: boolean)
	{
		if (leftSpeedPowerUp)
			this.ctx!.drawImage(logo, this.ctx!.canvas.width / 3.03, this.ctx!.canvas.height / 1.20, 40, 40);
		if (rightSpeedPowerUp)
			this.ctx!.drawImage(logo, this.ctx!.canvas.width / 1.60, this.ctx!.canvas.height / 1.20, 40, 40);
	}

	signInToPlay() : LinkZone
	{
		return (this.text("Sign in to play", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, "black", "Courier New"));
	}
}
