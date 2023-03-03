import { Controller, Get, Param} from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
class MessageController
{
	constructor(private messageService: MessageService) {}

	@Get('')
	async getAllMessages()
	{
		return (await this.messageService.getAllMessages());
	}

}

export default MessageController;
