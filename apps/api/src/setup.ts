import fastifyCookie from '@fastify/cookie';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ZodValidationPipe } from 'nestjs-zod';
import { API_PREFIX } from '@kids-chores/contracts';

export const setupApp = async (app: NestFastifyApplication): Promise<void> => {
  await app.register(fastifyCookie);
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableShutdownHooks();
};
