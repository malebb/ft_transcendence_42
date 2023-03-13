import { Controller, Get, Post, Param, Delete} from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from 'ft_transcendence';

@Controller('message')
class MessageController
{
	constructor(private messageService: MessageService) {}

	@Post('create-message')
	async createMessageByRoomName(@Param() message: Message, room: string)
	{
		return (await this.messageService.createMessage(message, room));
	}

	@Get('all-messages/:room')
	async getAllMessagesByRoomName(@Param('room') room: string)
	{
		return (await this.messageService.getAllMessagesByRoomName(room));
	}

	@Delete('delete-messages')
	async deleteAllMessagesByRoomName(room: string)
	{
		return (await this.messageService.deleteAllMessagesByRoomName(room));
	}

}

export default MessageController;
