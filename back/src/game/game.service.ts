import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService)
    {
	}

	async addGame(gameId: string)
	{
		await this.prisma.game.create(
		{
  			data: {
   				 gameId: gameId,
			},
		})
	}

	async getGames()
	{
		return (await this.prisma.game.findMany());
	}

	async removeGame(gameId: string)
	{
		const game = await this.prisma.game.delete(
		{
 			where: {
 				gameId: gameId,
 			 },
		})
	}

}
