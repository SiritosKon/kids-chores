import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { MeResponse, Session } from '@kids-chores/contracts';
import { isUniqueViolation, PrismaService } from '../../platform/database';
import { OutboxService } from '../../platform/outbox';
import { FAMILY_DELETED_EVENT, FAMILY_DELETED_VERSION } from './constants';
import type { AccountProfile, SignedIn } from './types';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService
  ) {}

  async signIn(provider: string, subjectHash: string, profile: AccountProfile): Promise<SignedIn> {
    const account = await this.prisma.authAccount.findUnique({
      where: { provider_subjectHash: { provider, subjectHash } },
      select: { userId: true },
    });
    if (account) {
      if (profile.name || profile.emailHash) {
        await this.prisma.user.update({ where: { id: account.userId }, data: profile });
      }
      return this.addDevice(account.userId);
    }
    try {
      return await this.createFamily(provider, subjectHash, profile);
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.signIn(provider, subjectHash, profile);
      }
      throw error;
    }
  }

  async addDevice(userId: string): Promise<SignedIn> {
    const { familyId } = await this.prisma.membership.findFirstOrThrow({
      where: { userId },
      select: { familyId: true },
      orderBy: { createdAt: 'asc' },
    });
    const deviceId = randomUUID();
    await this.prisma.inFamily(familyId, (tx) => tx.device.create({ data: { id: deviceId, familyId, userId } }));
    return { userId, familyId, deviceId };
  }

  async me(session: Session): Promise<MeResponse> {
    await this.prisma.inFamily(session.familyId, (tx) =>
      tx.device.updateMany({ where: { id: session.deviceId }, data: { lastSeenAt: new Date() } })
    );
    const passkeys = await this.prisma.passkey.count({ where: { userId: session.userId } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { name: true } });
    return {
      userId: session.userId,
      familyId: session.familyId,
      deviceId: session.deviceId,
      name: user.name,
      hasPasskey: passkeys > 0,
    };
  }

  async remove(session: Session): Promise<void> {
    const { familyId, userId } = session;
    await this.prisma.inFamily(familyId, async (tx) => {
      await tx.outbox.deleteMany({ where: { familyId } });
      await tx.user.delete({ where: { id: userId } });
      await tx.family.delete({ where: { id: familyId } });
      await this.outbox.record(tx, {
        type: FAMILY_DELETED_EVENT,
        version: FAMILY_DELETED_VERSION,
        familyId,
        payload: {},
      });
    });
  }

  private async createFamily(provider: string, subjectHash: string, profile: AccountProfile): Promise<SignedIn> {
    const signedIn: SignedIn = { userId: randomUUID(), familyId: randomUUID(), deviceId: randomUUID() };
    const { userId, familyId, deviceId } = signedIn;
    await this.prisma.inFamily(familyId, async (tx) => {
      await tx.user.create({ data: { id: userId, ...profile } });
      await tx.family.create({ data: { id: familyId } });
      await tx.membership.create({ data: { userId, familyId } });
      await tx.authAccount.create({ data: { id: randomUUID(), provider, subjectHash, userId } });
      await tx.device.create({ data: { id: deviceId, familyId, userId } });
    });
    return signedIn;
  }
}
