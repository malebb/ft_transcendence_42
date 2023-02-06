import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';

// checker pour mettre ailleurs (chat.ts ?????)
import { Server } from 'socket.io';
import cors from 'cors';
// import * as config from 'config';
import socket from "./chat/tmp/socket";
import http from 'http';
const io = require('socket.io');


async function bootstrap() {
	
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({whitelist: true,}));
	app.enableCors();
	
	var http = require('http').createServer(app);
	// const io = require('socket.io').listen(http);


	// const io = new Server(server, {
	// 	cors: {
	// 		origin: "http://localhost:3333",
	// 		credentials: true,
	// 	}
	// });

	io.on("connection", (socket) => {
		console.log("socket.io connected")
	});
	// const http = require("http");
	// // const server = http.createServer(app);
	// const server = require('http').Server(app);
	// const io = require("socket.io")(server);
	// const socket = io.listen(server);
	// await server.listen(3333);
	await app.listen(3333);
}
bootstrap();
