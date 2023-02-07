import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';

// checker pour mettre ailleurs (chat.ts ?????)
import * as cors from 'cors';
import { ChatServer } from './chat/chat-server';
import { Server } from "socket.io";

async function bootstrap() {
	
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({whitelist: true,}));
	// si on veut les options par default de cors... (methode)
	// app.enableCors();
	// si on veut plus de controle sur cors... (fonction middleware)
	app.use(cors ({
		origin: "*",
		credentials: true,
	}));
	// les deux sont similaires

	// recupere l'instance http de app :
	// const server = require('http').createServer();
	// const io = require('socket.io')(server);


	// evenement de connection pour gerer les sockets
	// io.on('connection', (socket) => {
	// 	console.log("clien connected");
	// });

	await app.listen(3333);

}
bootstrap();
