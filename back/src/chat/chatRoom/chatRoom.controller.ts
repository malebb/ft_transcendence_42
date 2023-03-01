import { Controller, Get, Param} from '@nestjs/common';
import { ChatRoomService } from './chatRoom.service';

@Controller('chatRoom')
class ChatRoomController
{
	constructor(private ChatRoomService: ChatRoomService) {}
/*
	@Get('')
	async getGame()
	{
		return (await this.ChatRoomService.getChatRoom());
	}
	*/
}

export default ChatRoomController;
