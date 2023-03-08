import { Global, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import MessageController from './message.controller';
import { UserModule } from 'src/user/user.module';
import { ChatRoomModule } from '../chatRoom/chatRoom.module';
import { MessageGateway } from './message.gateway';

@Global()
@Module({
	providers: [MessageService, MessageGateway],
	exports: [MessageService],
	controllers: [MessageController],
	imports: [UserModule, ChatRoomModule],
})
export class MessageModule{};
