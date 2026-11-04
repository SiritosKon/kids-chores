import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { RelayModule } from './relay.module';
import { RelayService } from './platform/outbox';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(RelayModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const relay = app.get(RelayService);
  const stop = (): void => relay.stop();
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  await relay.run();
  await app.close();
};

void bootstrap();
