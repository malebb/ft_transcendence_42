import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from 'ft_transcendence';
import { GetUser } from '../../auth/decorator';

@Controller('message')
class MessageController {
	constructor(private messageService: MessageService) { }

	@Post('create-message')
	async createMessageByRoomName(@Param() message: Message, room: string, @GetUser('id') id: number) {
		return (await this.messageService.createMessage(message, room, id));
	}

	@Get(':room')
	async getAllMessagesByRoomName(@Param('room') room: string,
								  @GetUser('id') userId: number) {
		// console.log("controller = ", room);
		return (await this.messageService.getAllMessagesByRoomName(room, userId));
	}

	@Delete('delete-messages')
	async deleteAllMessagesByRoomName(room: string) {
		return (await this.messageService.deleteAllMessagesByRoomName(room));
	}

	@Get('/private/:roomId')
	async getAllPrivateRoomMessagesByRoomId(@Param('roomId') roomDataString: string)
	{
		const roomId = JSON.parse(roomDataString).id;
		return (await this.messageService.getAllPrivateRoomMessagesByRoomId(roomId));
	}

}

export default MessageController;
