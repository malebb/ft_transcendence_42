import { Global, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { ChatRoomModule } from './chatRoom/chatRoom.module';
import { MessageModule } from './message/message.module';
// import { UserService } from 'src/user/user.service';
// import { UserController } from 'src/user/user.controller';

@Global()
@Module({
  providers: [ChatService, ChatGateway, UserService, UserController, JwtService],
  exports: [ChatService],
  controllers: [ChatController],
  imports: [UserModule, ChatRoomModule, MessageModule],
})
export class ChatModule {}