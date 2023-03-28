import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useRef, useEffect, useState } from 'react';
import { JwtGuard } from './auth/guard';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { credentials: true, origin: process.env.FRONT_URL },
  });

  console.log('ah');
  console.log('URL = ', process.env.FRONT_URL);
  console.log('be');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // app.enableCors({
  //   origin: process.env.FRONT_URL,
  //   credentials: true,
  // });
  app.use(cookieParser());

  await app.listen(3333);
}

bootstrap();
