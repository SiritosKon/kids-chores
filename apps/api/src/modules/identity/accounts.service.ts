import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { MeResponse, Session } from '@kids-chores/contracts';
import { isUniqueViolation, PrismaService } from '../../platform/database';
import { FamilyService } from './family.service';
import { MembershipsService } from './memberships.service';
import type { AccountProfile, RemovedUser, SignedIn } from './types';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly memberships: MembershipsService,
    private readonly family: FamilyService
  ) {}

  async signIn(provider: string, subjectHash: string, profile: AccountProfile): Promise<SignedIn> {
    const account = await this.prisma.authAccount.findUnique({
      where: { provider_subjectHash: { provider, subjectHash } },
      select: { userId: true },
    });
    if (account) {
      if (profile.name) {
        await this.prisma.user.update({ where: { id: account.userId }, data: { name: profile.name } });
      }
      await this.saveContacts(account.userId, profile);
      return this.addDevice(account.userId);
    }
    try {
      const signedIn = await this.createAccount(provider, subjectHash, profile.name);
      await this.saveContacts(signedIn.userId, profile);
      return signedIn;
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.signIn(provider, subjectHash, profile);
      }
      throw error;
    }
  }

  async addDevice(userId: string): Promise<SignedIn> {
    const membership = await this.prisma.membership.findUnique({ where: { userId }, select: { familyId: true } });
    const familyId = membership?.familyId ?? (await this.memberships.newFamily(userId));
    const deviceId = randomUUID();
    await this.prisma.inFamily(familyId, (tx) => tx.device.create({ data: { id: deviceId, familyId, userId } }));
    return { userId, familyId, deviceId };
  }

  async me(session: Session): Promise<MeResponse> {
    const membership = await this.prisma.membership.findUnique({ where: { userId: session.userId } });
    if (membership?.familyId !== session.familyId) {
      throw new UnauthorizedException();
    }
    await this.prisma.inFamily(session.familyId, (tx) =>
      tx.device.updateMany({ where: { id: session.deviceId }, data: { lastSeenAt: new Date() } })
    );
    const passkeys = await this.prisma.passkey.count({ where: { userId: session.userId } });
    const members = await this.prisma.membership.count({ where: { familyId: session.familyId } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { name: true } });
    return {
      userId: session.userId,
      familyId: session.familyId,
      deviceId: session.deviceId,
      name: user.name,
      hasPasskey: passkeys > 0,
      role: membership.role,
      members,
      joinRequests: membership.role === 'owner' ? await this.family.pendingRequests(session) : 0,
    };
  }

  remove(session: Session): Promise<RemovedUser> {
    return this.memberships.removeUser(session.userId, session.familyId);
  }

  private async saveContacts(userId: string, profile: AccountProfile): Promise<void> {
    for (const { kind, hash } of profile.contacts) {
      await this.prisma.userContact.upsert({
        where: { kind_hash: { kind, hash } },
        create: { kind, hash, userId },
        update: { userId },
      });
    }
  }

  private async createAccount(provider: string, subjectHash: string, name?: string): Promise<SignedIn> {
    const signedIn: SignedIn = { userId: randomUUID(), familyId: randomUUID(), deviceId: randomUUID() };
    const { userId, familyId, deviceId } = signedIn;
    await this.prisma.inFamily(familyId, async (tx) => {
      await tx.user.create({ data: { id: userId, name } });
      await tx.family.create({ data: { id: familyId } });
      await tx.membership.create({ data: { userId, familyId, role: 'owner' } });
      await tx.authAccount.create({ data: { id: randomUUID(), provider, subjectHash, userId } });
      await tx.device.create({ data: { id: deviceId, familyId, userId } });
    });
    return signedIn;
  }
}
