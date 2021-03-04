import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as Express from "express";
import { ExpressAdapter } from '@nestjs/platform-express';

const port = process.env.APP_PORT || 3000;
const appVersion = process.env.APP_VERSION || 'v1';

const server = Express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  app.setGlobalPrefix(appVersion);
  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`);
}
bootstrap();
