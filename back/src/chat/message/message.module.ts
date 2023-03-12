import { Global, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import MessageController from './message.controller';
import { MessageGateway } from './message.gateway';

@Global()
@Module({
	providers: [MessageService, MessageGateway],
	exports: [MessageService],
	controllers: [MessageController],
})
export class MessageModule{};