import { Injectable } from '@nestjs/common'
import { Room } from './pong.interface'

@Injectable()
export class PongService
{
	queue : string[] = [];

	addPlayer(playerId : string)
	{
		this.queue.push(playerId);
	}

	removePlayer(playerId : string)
	{
		this.queue.splice(this.queue.indexOf(playerId), 1);
	}

	checkQueue(playerId : string) : Room
	{
		let room : Room = {id :  "", opponentId : ""};

		for (let i = 0; i < this.queue.length; ++i)
		{
			if (this.queue[i] === playerId)
				continue ;
			room.id = this.queue[i] < playerId ? this.queue[i] + playerId : playerId + this.queue[i];
			room.opponentId = this.queue[i];
			this.queue.splice(this.queue.indexOf(playerId), 1);
			this.queue.splice(this.queue.indexOf(room.opponentId), 1);
		}
		return (room);
	}
}
