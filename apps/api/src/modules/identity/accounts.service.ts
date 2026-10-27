import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { MeResponse, Session } from '@kids-chores/contracts';
import { isUniqueViolation, PrismaService } from '../../platform/database';
import type { SignedIn } from './types';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async signIn(provider: string, subjectHash: string): Promise<SignedIn> {
    const account = await this.prisma.authAccount.findUnique({
      where: { provider_subjectHash: { provider, subjectHash } },
      select: { userId: true },
    });
    if (account) {
      return this.addDevice(account.userId);
    }
    try {
      return await this.createFamily(provider, subjectHash);
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.signIn(provider, subjectHash);
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
    return {
      userId: session.userId,
      familyId: session.familyId,
      deviceId: session.deviceId,
      hasPasskey: passkeys > 0,
    };
  }

  private async createFamily(provider: string, subjectHash: string): Promise<SignedIn> {
    const signedIn: SignedIn = { userId: randomUUID(), familyId: randomUUID(), deviceId: randomUUID() };
    const { userId, familyId, deviceId } = signedIn;
    await this.prisma.inFamily(familyId, async (tx) => {
      await tx.user.create({ data: { id: userId } });
      await tx.family.create({ data: { id: familyId } });
      await tx.membership.create({ data: { userId, familyId } });
      await tx.authAccount.create({ data: { id: randomUUID(), provider, subjectHash, userId } });
      await tx.device.create({ data: { id: deviceId, familyId, userId } });
    });
    return signedIn;
  }
}
