import { Controller, Get, Param, Post, Body, Patch,
ParseIntPipe} from '@nestjs/common';
import { IsInt, IsString, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ChatRoomService } from './chatRoom.service';

import { GetUser } from '../../auth/decorator';

import { Accessibility } from 'ft_transcendence';

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

	@Post(':name')
	async joinChatRoom(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto)
	{
		await this.chatRoomService.joinChatRoom(chatRoomName, chatRoomDto.userId)
	}

	@Patch('changeOwner/:name')
	async updateOwner(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto)
	{
		await this.chatRoomService.updateOwner(chatRoomName, chatRoomDto.userId);
	}

	@Patch('addAdmin/:name')
	async addAdmin(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto)
	{
		await this.chatRoomService.addAdmin(chatRoomName, chatRoomDto.userId);
	}

	@Patch('removeAdmin/:name')
	async removeAdmin(@Param('name') chatRoomName: string, @Body() chatRoomDto: ChatRoomDto)
	{
		await this.chatRoomService.removeAdmin(chatRoomDto.userId, chatRoomName);
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
		await this.chatRoomService.removeUserFromRoom(userId, chatRoomName);
	}
}

export default ChatRoomController;
