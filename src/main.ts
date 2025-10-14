
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
<<<<<<< HEAD
import { EnvConfig } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

=======
import * as dotenv from 'dotenv';
import { EnvConfig } from './config/env.config';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);


>>>>>>> 7346320aac4830aeeaf520f4435c2b160358634d
  await app.listen(EnvConfig.PORT);
  Logger.log(`🚀 Application is running on: http://localhost:3000`);
}

bootstrap();
