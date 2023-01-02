import { Injectable } from '@nestjs/common'
import { Room } from './pong.interface'

@Injectable()
export class PongService
{
	queue : string[] = [];

	addPlayer(clientId : string)
	{
		this.queue.push(clientId);
	}

	checkQueue(clientId : string) : Room
	{
		let room : Room = {id :  "", opponentId : ""};

		for (let i = 0; i < this.queue.length; ++i)
		{
			if (this.queue[i] === clientId)
				continue ;
			room.id = this.queue[i] < clientId ? this.queue[i] + clientId : clientId + this.queue[i];
			room.opponentId = this.queue[i];
			this.queue.splice(this.queue.indexOf(clientId), 1);
			this.queue.splice(this.queue.indexOf(room.opponentId), 1);
		}
		return (room);
	}
/*
	checkQueue(clientId : string)
	{
		return (new Promise(resolve => {
			console.log("check for opponent ... Queue size = " + this.queue.length);
			const intervalId = setInterval(() => {
			for (let i = 0; i < this.queue.length; ++i)
			{
				if (this.queue[i] === clientId)
					continue ;
				console.log("clientId = " + clientId + "this.queue[i]", this.queue[i]);
				clearInterval(intervalId);
				this.queue[i] < clientId ? resolve(this.queue[i] + clientId) : resolve(clientId + this.queue[i]);
			}
			}, 2000);
		}));
	}

	async findRoom(clientId : string)
	{
		return (await this.checkQueue(clientId));
	}
	*/
}
