import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as Express from 'express';
import * as morgan from 'morgan';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
// TODO: SET UP RateLimit
// import * as rateLimit from 'express-rate-limit';

// const apiLimiter = rateLimit({
//   windowMs: 55 * 60 * 1000,
//   max: 100,
//   message: 'Too many request from this IP, please try again after an hour',
// });

const port = process.env.APP_PORT || 3000;
const appVersion = process.env.APP_VERSION || 'v1';

const server = Express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable cors
  app.enableCors();

  // Body Parser
  app.use(Express.json({ limit: '1mb' }));
  app.use(Express.urlencoded({ extended: true }));

  // Enable logging
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' },
  );
  app.use(morgan('combined', { stream: accessLogStream }));

  // Global Prefix
  app.setGlobalPrefix(appVersion);

  // Set ratelimit
  // app.use(`/${appVersion}/rate`, apiLimiter);

  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`);
}
bootstrap();
