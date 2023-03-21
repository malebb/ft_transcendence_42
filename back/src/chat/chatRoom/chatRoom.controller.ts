import { Controller, Get, Param, Post, Body, Patch,
ParseIntPipe} from '@nestjs/common';
import { ChatRoomService } from './chatRoom.service';
import { GetUser } from '../../auth/decorator';
import { PenaltyDto } from '../penalty/Penalty';
import { ChatRoomDto } from './ChatRoomDto';


@Controller('chatRoom')
class ChatRoomController
{
	constructor(private chatRoomService: ChatRoomService) {}

	@Post('')
	async createRoom(@Body() chatRoom: ChatRoomDto,
					 @GetUser('id') creatorId: number)
	{
		return (await this.chatRoomService.createChatRoom(chatRoom, creatorId));
	}

	@Get('notJoined')
	async getNotJoinedRooms(@GetUser('id') userId: number)
	{
		return (await this.chatRoomService.getNotJoinedRooms(userId));
	}

	@Get('joined')
	async getJoinedRooms(@GetUser('id') userId: number)
	{
		return (await this.chatRoomService.getJoinedRooms(userId));
	}

	@Get('publicInfos/:name')
	async getPublicInfosFromChat(@Param('name') name: string,
								 @GetUser('id') userId: number)
	{
		return (await this.chatRoomService.getPublicInfosFromChat(name, userId));
	}

	@Get('member/:name')
	async getMember(@Param('name') name: string,
					@GetUser('id') userId: number)
	{
		return (await this.chatRoomService.getMember(userId, name));
	}

	@Patch('joinRoom/:name')
	async joinChatRoom(@Param('name') chatRoomName: string,
					   @Body() chatRoom: ChatRoomDto,
					   @GetUser('id') userId: number)
	{
		await this.chatRoomService.joinChatRoom(chatRoomName, chatRoom, userId)
	}

	@Post('checkPassword/:name')
	async checkPassword(@Param('name') chatRoomName: string,
						@Body() chatRoomDto: ChatRoomDto,
					   @GetUser('id') userId)
	{
		await this.chatRoomService.checkPassword(chatRoomName, chatRoomDto.password, userId);
	}

	@Patch('makeOwner/:name')
	async makeOwner(@Param('name') chatRoomName: string,
					@Body() chatRoomDto: ChatRoomDto,
					@GetUser('id') authorId: number)
	{
		await this.chatRoomService.makeOwner(chatRoomName, chatRoomDto.userId, authorId);
	}

	@Patch('makeAdmin/:name')
	async addAdmin(@Param('name') chatRoomName: string,
				   @Body() chatRoomDto: ChatRoomDto,
				   @GetUser('id') authorId: number)
	{
		await this.chatRoomService.makeAdmin(chatRoomName, chatRoomDto.userId, authorId);
	}

	@Patch('removeAdmin/:name')
	async removeAdmin(@Param('name') chatRoomName: string,
					  @Body() chatRoomDto: ChatRoomDto,
					  @GetUser('id') authorId: number)
	{
		await this.chatRoomService.removeAdmin(chatRoomDto.userId, chatRoomName, authorId);
	}

	@Patch('kick/:name')
	async kick(@Param('name') chatRoomName: string,
					  @Body() chatRoomDto: ChatRoomDto,
					  @GetUser('id') authorId: number)
	{
		await this.chatRoomService.kick(chatRoomName, chatRoomDto.userId, authorId);
	}

	@Patch('password/:name')
	async updateRoomPassword(@Param('name') chatRoomName: string,
							 @Body() chatRoomDto: ChatRoomDto,
							 @GetUser('id') userId: number)
	{
		await this.chatRoomService.updateRoomPassword(chatRoomName, chatRoomDto.password, userId)
	}

	@Patch('removePassword/:name')
	async removePassword(@Param('name') chatRoomName: string,
						 @GetUser('id') userId: number)
	{
		await this.chatRoomService.removePassword(chatRoomName, userId);
	}

	@Patch('leaveRoom/:name')
	async leaveRoom(@Param('name') chatRoomName: string,
					@GetUser('id') userId: number)
	{
		await this.chatRoomService.leaveRoom(chatRoomName, userId);
	}

	@Get('mutedMembers/:name')
	async getMuted(@Param('name') chatRoomName: string,
				  @GetUser('id') userId: number)
	{
		return (await this.chatRoomService.getUsersMuted(chatRoomName, userId));
	}

	@Post('penalty/:name')
	async penalty(@Param('name') chatRoomName: string,
				  @Body() penalty: PenaltyDto,
				  @GetUser('id') authorId: number)
	{
		await this.chatRoomService.penalty(chatRoomName, penalty, authorId);
	}

	@Get('myBan/:name')
	async myBan(@Param('name') chatRoomName: string,
				@GetUser('id') userId: number)
	{
		return (await this.chatRoomService.myBan(chatRoomName, userId));
	}

	@Get('myMute/:name')
	async myMute(@Param('name') chatRoomName: string,
				@GetUser('id') userId: number)
	{
		return (await this.chatRoomService.myMute(chatRoomName, userId));
	}
}

export default ChatRoomController;
