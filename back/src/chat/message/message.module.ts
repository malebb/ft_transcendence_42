import { Global, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import MessageController from './message.controller';
import { MessageGateway } from './message.gateway';
import { ChatRoomModule } from '../chatRoom/chatRoom.module';
import PenaltyModule from '../penalty/penalty.module';

@Global()
@Module({
	imports: [ChatRoomModule, PenaltyModule],
	providers: [MessageService, MessageGateway],
	exports: [MessageService],
	controllers: [MessageController],
})
export class MessageModule{};
