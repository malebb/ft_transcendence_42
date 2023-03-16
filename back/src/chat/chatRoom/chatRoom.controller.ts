import { Controller, Get, Param, Post, Body, Patch,
ParseIntPipe} from '@nestjs/common';
import { IsInt, IsString, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ChatRoomService } from './chatRoom.service';

import { GetUser } from '../../auth/decorator';

import { Accessibility } from 'ft_transcendence';

import { ChatRoom } from 'ft_transcendence';

import { PenaltyDto } from '../penalty/Penalty';

class ChatRoomDto {
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	userId?: number;

	@IsString()
	@IsOptional()
	password?: string;

	@IsOptional()
	accessibility?: Accessibility;

	@IsOptional()
	penalty?: PenaltyDto;
}

@Controller('chatRoom')
class ChatRoomController
{
	constructor(private chatRoomService: ChatRoomService) {}


	@Get('')
	async getAllRooms()
	{
		return (await this.chatRoomService.getAllRooms());
	}

	@Post('')
	async createRoom(@Body() chatRoom: ChatRoom)
	{
		return (await this.chatRoomService.createChatRoom(chatRoom));
	}

	@Get('notJoined/:userId')
	async getNotJoinedRooms(@Param('userId', ParseIntPipe) userId: number)
	{
		return (await this.chatRoomService.getNotJoinedRooms(userId));
	}

	@Get('joined/:userId')
	async getJoinedRooms(@Param('userId', ParseIntPipe) userId: number)
	{
		return (await this.chatRoomService.getJoinedRooms(userId));
	}

	@Get(':name')
	async getChatRoom(@Param('name') name: string)
	{
		return (await this.chatRoomService.getChatRoom(name));
	}

	@Get('member/:name')
	async getMember(@GetUser('id') userId: number, @Param('name') name: string)
	{
		return (await this.chatRoomService.getMember(userId, name));
	}
/*
	@Get('member/:name/:id')
	async getMemberById(@Param('name') roomName: string, @Param('id', ParseIntPipe) userId: number)
	{
		return (await this.chatRoomService.getMember(userId, roomName));
	}
*/

	@Post(':name')
	async joinChatRoom(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto)
	{
		await this.chatRoomService.joinChatRoom(chatRoomName, chatRoomDto.userId)
	}

	@Post('checkPassword/:name')
	async checkPassword(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto)
	{
		await this.chatRoomService.checkPassword(chatRoomName, chatRoomDto.password);
	}

	@Patch('makeOwner/:name')
	async makeOwner(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto, @GetUser('id') authorId: number)
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
	async updateRoomPassword(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto)
	{
		await this.chatRoomService.updateRoomPassword(chatRoomName, chatRoomDto.password)
	}

	@Patch('removePassword/:name')
	async removePassword(@Param('name') chatRoomName: string)
	{
		await this.chatRoomService.removePassword(chatRoomName);
	}

	@Patch('changeAccessibility/:name')
	async changeAccessibility(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto)
	{
		await this.chatRoomService.changeAccessibility(chatRoomName, chatRoomDto.accessibility);
	}

	@Patch('leaveRoom/:name')
	async leaveRoom(@Param('name') chatRoomName: string, @GetUser('id') userId: number)
	{
		await this.chatRoomService.leaveRoom(chatRoomName, userId);
	}

	@Get('userPenalties/:name')
	async getUserPenalties(@Param('name') chatRoomName: string, @GetUser('id') userId: number)
	{
		return (await this.chatRoomService.getUserPenalties(chatRoomName, userId));
	}

	@Get('mutedUsers/:name')
	async getMuted(@Param('name') chatRoomName: string)
	{
		return (await this.chatRoomService.getUsersMuted(chatRoomName));
	}

	@Post('penalty/:name')
	async penalty(@Param('name') chatRoomName: string,
				  @Body() penalty: PenaltyDto,
				  @GetUser('id') authorId: number)
	{
		await this.chatRoomService.penalty(chatRoomName, penalty, authorId);
	}
}

export default ChatRoomController;
