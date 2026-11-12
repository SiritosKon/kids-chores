import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import type { Membership, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../platform/database';
import { OutboxService } from '../../platform/outbox';
import { familyMediaPrefix, StorageService } from '../../platform/storage';
import { FAMILY_DELETED_EVENT, FAMILY_DELETED_VERSION } from './constants';
import type { RemovedUser } from './types';

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly storage: StorageService
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
    let dropped: string | null = null;
    const from = await this.prisma.$transaction(async (tx) => {
      const current = await tx.membership.findUnique({ where: { userId } });
      if (current?.familyId === target) {
        return target;
      }
      let devices: string[] = [];
      if (current) {
        await this.prisma.enterFamily(tx, current.familyId);
        const rows = await tx.device.findMany({ where: { userId, familyId: current.familyId }, select: { id: true } });
        devices = rows.map(({ id }) => id);
        dropped = (await this.leave(tx, current)) ? current.familyId : null;
      }
      await this.prisma.enterFamily(tx, target);
      await tx.membership.create({ data: { userId, familyId: target, role: 'parent' } });
      await tx.device.createMany({ data: devices.map((id) => ({ id, familyId: target, userId })) });
      await tx.joinRequest.deleteMany({ where: { userId } });
      return current?.familyId ?? null;
    });
    await this.dropMedia(dropped);
    return from;
  }

  async detach(userId: string, familyId: string): Promise<void> {
    const dropped = await this.prisma.inFamily(familyId, async (tx) => {
      const membership = await tx.membership.findUnique({ where: { userId } });
      return membership?.familyId === familyId ? this.leave(tx, membership) : false;
    });
    await this.dropMedia(dropped ? familyId : null);
  }

  async removeUser(userId: string, familyId: string): Promise<RemovedUser> {
    const removed = await this.prisma.inFamily(familyId, async (tx) => {
      const membership = await tx.membership.findUnique({ where: { userId } });
      const familyDropped = membership ? await this.leave(tx, membership) : false;
      await tx.user.delete({ where: { id: userId } });
      return { familyDropped };
    });
    await this.dropMedia(removed.familyDropped ? familyId : null);
    return removed;
  }

  private async dropMedia(familyId: string | null): Promise<void> {
    if (familyId === null) {
      return;
    }
    try {
      await this.storage.removePrefix(familyMediaPrefix(familyId));
    } catch (error) {
      this.logger.warn(`family media cleanup failed: ${error instanceof Error ? error.name : 'unknown error'}`);
    }
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
