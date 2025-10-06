import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // load biến môi trường
  const app = await NestFactory.create(AppModule);

  
  await app.listen(3000); // chạy server Nest (port tuỳ bạn)
  Logger.log(`🚀 Application is running on: http://localhost:3000`);
}

bootstrap();
