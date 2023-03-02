import { Controller, Get, Param} from '@nestjs/common';
import { ChatRoomService } from './chatRoom.service';

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
	async getChatRooms(@Param('name') name: string)
	{
		return (await this.ChatRoomService.getChatRoom(name));
	}
}

export default ChatRoomController;
