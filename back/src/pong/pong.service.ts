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

	removePlayer(clientId : string)
	{
		this.queue.splice(this.queue.indexOf(clientId), 1);
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
}
