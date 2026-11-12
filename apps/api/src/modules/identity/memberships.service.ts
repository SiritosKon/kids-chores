import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Membership, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../platform/database';
import { OutboxService } from '../../platform/outbox';
import { FAMILY_DELETED_EVENT, FAMILY_DELETED_VERSION } from './constants';
import type { RemovedUser } from './types';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService
  ) {}

  async newFamily(userId: string): Promise<string> {
    const familyId = randomUUID();
    await this.prisma.inFamily(familyId, async (tx) => {
      await tx.family.create({ data: { id: familyId } });
      await tx.membership.create({ data: { userId, familyId, role: 'owner' } });
    });
    return familyId;
  }

  async move(userId: string, target: string): Promise<string | null> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.membership.findUnique({ where: { userId } });
      if (current?.familyId === target) {
        return target;
      }
      let devices: string[] = [];
      if (current) {
        await this.prisma.enterFamily(tx, current.familyId);
        const rows = await tx.device.findMany({ where: { userId, familyId: current.familyId }, select: { id: true } });
        devices = rows.map(({ id }) => id);
        await this.leave(tx, current);
      }
      await this.prisma.enterFamily(tx, target);
      await tx.membership.create({ data: { userId, familyId: target, role: 'parent' } });
      await tx.device.createMany({ data: devices.map((id) => ({ id, familyId: target, userId })) });
      await tx.joinRequest.deleteMany({ where: { userId } });
      return current?.familyId ?? null;
    });
  }

  async detach(userId: string, familyId: string): Promise<void> {
    await this.prisma.inFamily(familyId, async (tx) => {
      const membership = await tx.membership.findUnique({ where: { userId } });
      if (membership?.familyId === familyId) {
        await this.leave(tx, membership);
      }
    });
  }

  removeUser(userId: string, familyId: string): Promise<RemovedUser> {
    return this.prisma.inFamily(familyId, async (tx) => {
      const membership = await tx.membership.findUnique({ where: { userId } });
      const familyDropped = membership ? await this.leave(tx, membership) : false;
      await tx.user.delete({ where: { id: userId } });
      return { familyDropped };
    });
  }

  private async leave(tx: Prisma.TransactionClient, membership: Membership): Promise<boolean> {
    const { userId, familyId } = membership;
    await tx.device.deleteMany({ where: { userId, familyId } });
    await tx.membership.delete({ where: { userId_familyId: { userId, familyId } } });
    const next = await tx.membership.findFirst({ where: { familyId }, orderBy: { createdAt: 'asc' } });
    if (!next) {
      await this.dropFamily(tx, familyId);
      return true;
    }
    if (membership.role === 'owner') {
      await tx.membership.update({
        where: { userId_familyId: { userId: next.userId, familyId } },
        data: { role: 'owner' },
      });
    }
    return false;
  }

  private async dropFamily(tx: Prisma.TransactionClient, familyId: string): Promise<void> {
    await tx.outbox.deleteMany({ where: { familyId } });
    await tx.family.delete({ where: { id: familyId } });
    await this.outbox.record(tx, {
      type: FAMILY_DELETED_EVENT,
      version: FAMILY_DELETED_VERSION,
      familyId,
      payload: {},
    });
  }
}
