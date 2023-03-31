import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { credentials: true, origin: process.env.FRONT_URL },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  await app.listen(3333);
}

bootstrap();
