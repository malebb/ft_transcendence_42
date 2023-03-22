import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useRef, useEffect, useState } from 'react';
import { JwtGuard } from './auth/guard';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cors({ origin: '*' }), cookieParser());

  await app.listen(3333);
}

bootstrap();
