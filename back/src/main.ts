import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// checker pour mettre ailleurs (chat.ts ?????)
const express = require("express");
const cors = require("cors");
const testUserRoutes = require("./chat/user.routes");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
//

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true,}));
  app.enableCors();
  await app.listen(3333);
}
bootstrap();
