import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { setupApp } from '../setup';
import type { InjectedCookies } from './types';

export const createTestApp = async (): Promise<NestFastifyApplication> => {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: false,
    abortOnError: false,
  });
  await setupApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
};

export const cookieHeader = (response: InjectedCookies): string =>
  response.cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
