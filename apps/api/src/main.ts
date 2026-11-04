import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { loadConfig } from './platform/config';
import { trustedHops } from './platform/http';
import { setupApp } from './setup';

const bootstrap = async (): Promise<void> => {
  const config = loadConfig(process.env, __dirname);
  const adapter = new FastifyAdapter({ trustProxy: trustedHops(config.TRUST_PROXY_HOPS) });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  await setupApp(app);
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
};

void bootstrap();
