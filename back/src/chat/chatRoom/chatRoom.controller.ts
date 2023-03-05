import { Controller, Get, Param, Post, Body, Headers, Patch } from '@nestjs/common';
import { ChatRoomService } from './chatRoom.service';

import { GetUser } from '../../auth/decorator';

import { Accessibility } from 'ft_transcendence';

interface UserDto {
	username: string
}

interface passwordDto {
	password: string
}

interface AccessibilityDto {
	accessibility: Accessibility;
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

	@Get('notJoined:username')
	async getNotJoinedRooms(@Param('username') username: string)
	{
		return (await this.chatRoomService.getNotJoinedRooms(username));
	}

	@Get('joined:username')
	async getJoinedRooms(@Param('username') username: string)
	{
		return (await this.chatRoomService.getJoinedRooms(username));
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

	@Get('members/:name')
	async getMembers(@Param('name') name: string)
	{
		return (await this.chatRoomService.getMembers(name));
	}

	@Get('owner/:name')
	async getOwner(@Param('name') name: string)
	{
		return (await this.chatRoomService.getOwner(name));
	}

	@Post(':name')
	async joinChatRoom(@Param('name') chatRoomName: string, @Body() user: UserDto)
	{
		await this.chatRoomService.joinChatRoom(chatRoomName, user.username)
	}

	@Patch('password/:name')
	async updateRoomPassword(@Param('name') chatRoomName: string, @Body() password: passwordDto)
	{
		await this.chatRoomService.updateRoomPassword(chatRoomName, password.password)
	}

	@Patch('removePassword/:name')
	async removePassword(@Param('name') chatRoomName: string)
	{
		await this.chatRoomService.removePassword(chatRoomName);
	}

	@Patch('changeAccessibility/:name')
	async changeAccessibility(@Param('name') chatRoomName: string, @Body() accessibility: AccessibilityDto)
	{
		await this.chatRoomService.changeAccessibility(chatRoomName, accessibility.accessibility);
	}
}

export default ChatRoomController;
