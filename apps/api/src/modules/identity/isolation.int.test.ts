import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../../platform/database';
import { createTestApp } from '../../testing';
import { AccountsService } from './accounts.service';
import type { SignedIn } from './types';

describe('family isolation in Postgres', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let a: SignedIn;
  let b: SignedIn;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const accounts = app.get(AccountsService);
    a = await accounts.signIn('dev', randomUUID());
    b = await accounts.signIn('dev', randomUUID());
  });

  afterAll(async () => {
    await app.close();
  });

  it('shows a family its own rows', async () => {
    const devices = await prisma.inFamily(a.familyId, (tx) => tx.device.findMany({ where: { familyId: a.familyId } }));
    expect(devices.map((device) => device.id)).toEqual([a.deviceId]);
  });

  it('hides the other family even when asked for it by id', async () => {
    const family = await prisma.inFamily(b.familyId, (tx) => tx.family.findUnique({ where: { id: a.familyId } }));
    const devices = await prisma.inFamily(b.familyId, (tx) => tx.device.findMany({ where: { familyId: a.familyId } }));
    expect(family).toBeNull();
    expect(devices).toEqual([]);
  });

  it('does not let a family change or add rows of another', async () => {
    const updated = await prisma.inFamily(b.familyId, (tx) =>
      tx.device.updateMany({ where: { familyId: a.familyId }, data: { lastSeenAt: new Date(0) } })
    );
    expect(updated.count).toBe(0);
    await expect(
      prisma.inFamily(b.familyId, (tx) =>
        tx.device.create({ data: { id: randomUUID(), familyId: a.familyId, userId: a.userId } })
      )
    ).rejects.toThrow();
  });

  it('shows nothing outside a family transaction', async () => {
    await prisma.inFamily(a.familyId, (tx) => tx.device.count());
    expect(await prisma.device.findMany({ where: { familyId: a.familyId } })).toEqual([]);
    expect(await prisma.family.findMany({ where: { id: { in: [a.familyId, b.familyId] } } })).toEqual([]);
  });
});
