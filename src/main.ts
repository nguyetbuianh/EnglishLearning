
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { EnvConfig } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(EnvConfig.PORT);
  Logger.log(`🚀 Application is running on: http://localhost:3000`);
}

bootstrap();
