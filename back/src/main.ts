import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useRef, useEffect, useState } from "react";
import { JwtGuard } from './auth/guard';
import * as cors from 'cors';
<<<<<<< HEAD

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true,}));
  app.use(cors({origin: "*"}));
  //const server = require('http').createServer();
  //const io = require('socket.io')(server, {cors: {origin: "*"}});
  //app.enableCors();
  await app.listen(3333);
=======
// import socket from './chat/socket'

async function bootstrap() {

	// socket();

	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({whitelist: true,}));
	app.use(cors());

	await app.listen(3333);

>>>>>>> socket
}

bootstrap();

