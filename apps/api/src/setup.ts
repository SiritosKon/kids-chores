import fastifyCookie from '@fastify/cookie';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ZodValidationPipe } from 'nestjs-zod';
import { API_PREFIX, MEDIA_MAX_BYTES, MEDIA_TYPE } from '@kids-chores/contracts';

export const setupApp = async (app: NestFastifyApplication): Promise<void> => {
  await app.register(fastifyCookie);
  app
    .getHttpAdapter()
    .getInstance()
    .addContentTypeParser(MEDIA_TYPE, { parseAs: 'buffer', bodyLimit: MEDIA_MAX_BYTES }, (_request, body, done) => {
      done(null, body);
    });
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableShutdownHooks();
};
