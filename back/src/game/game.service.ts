import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService)
    {
	}

	async addGame(gameId: string, leftUserId: number, rightUserId: number)
	{
		await this.prisma.game.create(
		{
  			data: {
				 leftPlayer: {
					connect : {
						id: leftUserId
					}
				 },
				 rightPlayer: {
					connect : {
						id: rightUserId
					}	
				 },
   				 gameId: gameId,
			},
		})
	}

	async getGames()
	{
		return (await this.prisma.game.findMany(
		{
			include: {
				leftPlayer: true,
				rightPlayer: true
			}
		}
		));
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
