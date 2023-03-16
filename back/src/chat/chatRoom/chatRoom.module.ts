import { Module } from '@nestjs/common';
import { ChatRoomService } from './chatRoom.service';
import ChatRoomController from './chatRoom.controller';
import PenaltyModule from '../penalty/penalty.module';

@Module({
	imports: [PenaltyModule],
	controllers: [ChatRoomController],
	providers: [ChatRoomService],
	exports: [ChatRoomService]
})
export class ChatRoomModule{};
