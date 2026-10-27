import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { APP_CONFIG, type AppConfig } from './platform/config';
import { setupApp } from './setup';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  await setupApp(app);
  const config = app.get<AppConfig>(APP_CONFIG);
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
};

void bootstrap();
