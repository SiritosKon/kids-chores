import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MEDIA_MAX_BYTES, mediaCreatedSchema, meResponseSchema } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { mediaKey, StorageService } from '../../platform/storage';
import { MediaSweepService } from './media-sweep.service';
import { cookieHeader, createTestApp } from '../../testing';

const jpeg = (size = 64): Buffer => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(size - 4, 7)]);

describe('photos in the closed storage', () => {
  let app: NestFastifyApplication;
  let origin: string;

  beforeAll(async () => {
    app = await createTestApp();
    origin = new URL(app.get<AppConfig>(APP_CONFIG).PUBLIC_ORIGIN).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const devLogin = async (name: string): Promise<string> => {
    const response = await app.inject({ method: 'POST', url: '/v1/dev/login', headers: { origin }, payload: { name } });
    return cookieHeader(response);
  };

  const upload = (cookie: string, body: Buffer, type = 'image/jpeg') =>
    app.inject({ method: 'POST', url: '/v1/media', headers: { origin, cookie, 'content-type': type }, body });

  it('keeps a photo for its family only and deletes it on request', async () => {
    const tag = randomUUID().slice(0, 8);
    const mom = await devLogin(`mom-${tag}`);
    const tablet = await devLogin(`mom-${tag}`);
    const stranger = await devLogin(`stranger-${tag}`);
    const photo = jpeg(2048);

    const created = await upload(mom, photo);
    expect(created.statusCode).toBe(201);
    const { id } = mediaCreatedSchema.parse(created.json());

    const read = await app.inject({ method: 'GET', url: `/v1/media/${id}`, headers: { cookie: tablet } });
    expect(read.statusCode).toBe(200);
    expect(read.headers['content-type']).toBe('image/jpeg');
    expect(read.headers['cache-control']).toContain('private');
    expect(read.rawPayload.equals(photo)).toBe(true);

    expect((await app.inject({ method: 'GET', url: `/v1/media/${id}`, headers: { cookie: stranger } })).statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: `/v1/media/${id}` })).statusCode).toBe(401);
    const foreignDelete = await app.inject({ method: 'DELETE', url: `/v1/media/${id}`, headers: { origin, cookie: stranger } });
    expect(foreignDelete.statusCode).toBe(204);
    expect((await app.inject({ method: 'GET', url: `/v1/media/${id}`, headers: { cookie: mom } })).statusCode).toBe(200);

    expect((await app.inject({ method: 'DELETE', url: `/v1/media/${id}`, headers: { origin, cookie: mom } })).statusCode).toBe(204);
    expect((await app.inject({ method: 'GET', url: `/v1/media/${id}`, headers: { cookie: mom } })).statusCode).toBe(404);
  });

  it('takes only JPEG pictures up to a megabyte', async () => {
    const dad = await devLogin(`dad-${randomUUID().slice(0, 8)}`);
    expect((await upload(dad, Buffer.from('not a picture at all'))).statusCode).toBe(400);
    expect((await upload(dad, Buffer.from('<svg/>'), 'image/svg+xml')).statusCode).toBe(415);
    expect((await upload(dad, jpeg(MEDIA_MAX_BYTES + 1))).statusCode).toBe(413);
    expect((await upload(dad, jpeg(MEDIA_MAX_BYTES))).statusCode).toBe(201);
  });

  it('removes the family photos from the storage together with the family', async () => {
    const tag = randomUUID().slice(0, 8);
    const solo = await devLogin(`solo-${tag}`);
    const { familyId } = meResponseSchema.parse((await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie: solo } })).json());
    const { id } = mediaCreatedSchema.parse((await upload(solo, jpeg())).json());
    const storage = app.get(StorageService);
    expect(await storage.get(mediaKey(familyId, id))).not.toBeNull();
    expect((await app.inject({ method: 'DELETE', url: '/v1/me', headers: { origin, cookie: solo } })).statusCode).toBe(204);
    expect(await storage.get(mediaKey(familyId, id))).toBeNull();
  });

  it('sweeps files of families that are gone and files nobody points at', async () => {
    const storage = app.get(StorageService);
    const lost = mediaKey(randomUUID(), randomUUID());
    await storage.put(lost, jpeg(), 'image/jpeg');

    const keeper = await devLogin(`keeper-${randomUUID().slice(0, 8)}`);
    const { familyId } = meResponseSchema.parse((await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie: keeper } })).json());
    const { id } = mediaCreatedSchema.parse((await upload(keeper, jpeg())).json());
    const orphan = mediaKey(familyId, randomUUID());
    await storage.put(orphan, jpeg(), 'image/jpeg');

    await app.get(MediaSweepService).sweep();
    expect(await storage.get(lost)).toBeNull();
    expect(await storage.get(orphan)).toBeNull();
    expect(await storage.get(mediaKey(familyId, id))).not.toBeNull();
  });
});
