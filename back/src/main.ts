import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';

// checker pour mettre ailleurs (chat.ts ?????)
import { Server } from 'socket.io';
import cors from 'cors';
import * as config from 'config';
import socket from "./chat/socket";

// const port = 3333;
// const host = 127.0.0.1;
// const corsOrigin = config.get<number>("corsOrigin");

// const app = express();

const io = new Server({
	cors: {
		origin: "http://localhost:3333",
		credentials: true,
	}
});
// require("dotenv").config();
// app.use(cors());
// app.use(express.json());
//

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true,}));
  app.enableCors();

  //
	socket({ io });
  //

  await app.listen(3333);
}
bootstrap();
