import Skin from "../classes/Skin";
import MapData from "../interfaces/MapData";
import LinkZone from '../interfaces/LinkZone'; 

//export const CANVAS_FONT:string = 'Tilt Warp';
export const CANVAS_FONT:string = 'Poppins';
export const FONT_COLOR:string = 'white';

export default class Draw
{
	skins : Skin[] = [];
	mapList = [{name: "basic", path: "/images/basic.png"},
			{name: "beach", path: "/images/beach.png"},
			{name: "city", path: "/images/city.jpg"},
			{name: "jungle", path: "/images/jungle.png"},
			{name: "lava", path: "/images/lava.jpg"},
			{name: "nature", path: "/images/nature.jpg"},
			{name: "snow", path: "/images/snow.jpg"},
			{name: "space", path: "/images/space.jpg"}];
	checkboxStatus: boolean = false;

	constructor(public readonly ctx : CanvasRenderingContext2D | null)
	{
	}

	initFont()
	{
		return (new FontFace("Poppins", "url('http://localhost:3000/fonts/Poppins-SemiBold.ttf')"));
	}

	initCheckbox()
	{
		const checkbox = new Image();

		checkbox.src = './images/checkbox.png';
		return (checkbox);
	}

	initChecked()
	{
		const checked = new Image();

		checked.src = './images/checked.png';
		return (checked);
	}

	initOutGameBackground() : HTMLImageElement
	{
		const img = new Image();

		img.src = 'http://localhost:3000/images/purple.png';
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
				img.src = 'http://localhost:3000' + map.path;
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

		img.src = 'http://localhost:3000/images/speedPowerUp.png';
		return (img);
	}

	getTextZone(text: string, posX : number, posY : number)
	{
			let	textzone : TextMetrics = this.ctx!.measureText(text);

			return ({posX : posX - textzone.actualBoundingBoxLeft, posY : posY - textzone.actualBoundingBoxAscent,
			height: textzone.actualBoundingBoxAscent + textzone.actualBoundingBoxDescent,
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
		this.text("looking for player...", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT);
	}

	challenge(opponentUsername: string)
	{
		this.text("Waiting for " + opponentUsername + ' ...', this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT);
	}

	opponentDisconnection()
	{
		this.text("Opponent has left", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT);
	}
	
	skinsTitle()
	{
		this.text("Skins", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 6, 35, FONT_COLOR, CANVAS_FONT);
	}

	skin(name : string) : LinkZone
	{
		let margin : number = 125;
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
		this.text("Maps", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 6, 35, FONT_COLOR, CANVAS_FONT);
	}

	map(): LinkZone[]
	{
		let margin : number = 125;
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
			mapImg.src = 'http://localhost:3000' + map.path;
		});
		return (mapZones);
	}

	youWon()
	{
		this.text("You won!", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT);
	}

	youLost()
	{
		this.text("You lost!", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT);
	}

	score(scoreLeft: number, scoreRight: number)
	{
		this.text(scoreLeft.toString(), this.ctx!.canvas.width / 3.03, this.ctx!.canvas.height / 5, 55, "white", CANVAS_FONT);
		this.text(scoreRight.toString(), this.ctx!.canvas.width / 1.51, this.ctx!.canvas.height / 5, 55, "white", CANVAS_FONT);
	}

	usernames(leftUsername: string, rightUsername: string)
	{
		this.text(leftUsername, this.ctx!.canvas.width / 4.5, this.ctx!.canvas.height / 1.02, 15, "white", CANVAS_FONT);
		this.text(rightUsername, this.ctx!.canvas.width / 1.30, this.ctx!.canvas.height / 1.02, 15, "white", CANVAS_FONT);
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
		return (this.text("Sign in to play", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT));
	}

	checkbox(checkbox: HTMLImageElement): LinkZone
	{
		let	checkboxZone: LinkZone = {posX : this.ctx!.canvas.width / 1.8, posY: this.ctx!.canvas.height / 1.77, width: 20, height: 20}

		this.ctx!.drawImage(checkbox, checkboxZone.posX, checkboxZone.posY, checkboxZone.width, checkboxZone.height);
		return (checkboxZone);
	}

	checked(checkbox: HTMLImageElement): LinkZone
	{
		let	checkboxZone: LinkZone = {posX : this.ctx!.canvas.width / 1.8, posY: this.ctx!.canvas.height / 1.77, width: 20, height: 20}

		if (this.checkboxStatus)
			this.ctx!.drawImage(checkbox, checkboxZone.posX, checkboxZone.posY, checkboxZone.width, checkboxZone.height);
		return (checkboxZone);
	}

	updateCheckboxStatus()
	{
		if (this.checkboxStatus)
			this.checkboxStatus = false;
		else
			this.checkboxStatus = true;
	}

	spectatorEnd()
	{
		this.text("No game to spectate", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT);
	}

	alreadyInResearch()
	{
		this.text("You are already looking for a player", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT);
	}

	alreadyInGame()
	{
		this.text("You are already in a game", this.ctx!.canvas.width / 2, this.ctx!.canvas.height / 2, 35, FONT_COLOR, CANVAS_FONT);
	}
}
