import { Module } from '@nestjs/common';
import { ChatRoomService } from './chatRoom.service';
import ChatRoomController from './chatRoom.controller';

@Module({
	controllers: [ChatRoomController],
	providers: [ChatRoomService],
	exports: [ChatRoomService]
})
export class ChatRoomModule{};
