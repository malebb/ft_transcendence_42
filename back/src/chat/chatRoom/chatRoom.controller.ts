import { Controller, Get, Param, Post, Body, Headers} from '@nestjs/common';
import { ChatRoomService } from './chatRoom.service';

interface UserDto {
	username: string
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

	@Post(':name')
	async joinChatRoom(@Param('name') chatRoomName: string, @Body() user: UserDto)
	{
		await this.chatRoomService.joinChatRoom(chatRoomName, user.username)
	}
}

export default ChatRoomController;
