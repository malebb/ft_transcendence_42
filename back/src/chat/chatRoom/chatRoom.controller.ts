import { Controller, Get, Param, Post, Body, Headers} from '@nestjs/common';
import { ChatRoomService } from './chatRoom.service';

interface UserDto {
	username: string
}

@Controller('chatRoom')
class ChatRoomController
{
	constructor(private ChatRoomService: ChatRoomService) {}


	@Get('')
	async getAllRooms()
	{
		return (await this.ChatRoomService.getAllRooms());
	}

	@Get(':name')
	async getChatRoom(@Param('name') name: string)
	{
		return (await this.ChatRoomService.getChatRoom(name));
	}

	@Post(':name')
	async joinChatRoom(@Param('name') chatRoomName: string, @Body() user: UserDto)
	{
		await this.ChatRoomService.joinChatRoom(chatRoomName, user.username)
	}
}

export default ChatRoomController;
