import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { EnvConfig } from './config/env.config';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);


  await app.listen(EnvConfig.PORT);
  Logger.log(`🚀 Application is running on: http://localhost:3000`);
}

bootstrap();
