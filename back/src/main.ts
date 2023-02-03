import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';

// checker pour mettre ailleurs (chat.ts ?????)
import { Server } from 'socket.io';
import cors from 'cors';
import * as config from 'config';
import socket from "./chat/socket";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true,}));
  app.enableCors();

  await app.listen(3333);
}
bootstrap();
