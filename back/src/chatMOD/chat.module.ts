// fichier pour lier les controllers et providers de l'application

import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { Chat } from './chat.entity';
import { AuthModule } from '../auth/auth.module';
// import { TypeOrmModule } from '@nestjs/typeorm';

// @Module({

// 	// controllers: [ ChatController ],
// 	providers : [ ChatService ],

// })

// export class ChatModule {}
@Module({
	// imports: [
	// 	// TypeOrmModule.forRoot({
	// 	// 	type: 'postgres',
	// 	// 	host: 'localhost',
	// 	// 	username: 'postgres',
	// 	// 	password: '1234',
	// 	// 	database: 'task',
	// 	// 	entities: [Chat],
	// 	// 	synchronize: true,
	// 	// }),smModule.forFeature([Chat]),
	// 	AuthModule,
	// ],
	controllers: [ ChatController ],
	providers: [ ChatService, ChatGateway ],
})

export class ChatModule {}