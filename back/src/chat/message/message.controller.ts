import { Controller, Get, Param} from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
class MessageController
{
	constructor(private messageService: MessageService) {}

	@Get('all-messages')
	async getAllMessages()
	{
		return (await this.messageService.getAllMessagesByRoomName());
	}

}

export default MessageController;
