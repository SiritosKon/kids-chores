import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { pinHashSchema, type MemberPin, type Session, type SetPinRequest } from '@kids-chores/contracts';
import { PrismaService } from '../../platform/database';
import { VALKEY } from '../../platform/valkey';
import { PIN_GRANT_TTL_SECONDS } from './constants';
import { pinGrantKey, sameHash } from './lib';

@Injectable()
export class PinsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(VALKEY) private readonly valkey: Redis
  ) {}

  async grant(userId: string): Promise<void> {
    await this.valkey.set(pinGrantKey(userId), '1', 'EX', PIN_GRANT_TTL_SECONDS);
  }

  async set(session: Session, { pin, current }: SetPinRequest): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { pinHash: true } });
    const stored = pinHashSchema.safeParse(user.pinHash);
    const proven = stored.success && current !== undefined && sameHash(current, stored.data.hash, 'base64');
    if (stored.success && !proven && (await this.valkey.getdel(pinGrantKey(session.userId))) === null) {
      throw new ForbiddenException();
    }
    await this.prisma.user.update({ where: { id: session.userId }, data: { pinHash: pin } });
    await this.valkey.del(pinGrantKey(session.userId));
  }

  async family(familyId: string): Promise<MemberPin[]> {
    const members = await this.prisma.membership.findMany({
      where: { familyId },
      select: { userId: true, user: { select: { pinHash: true } } },
    });
    return members.flatMap(({ userId, user }) => {
      const pin = pinHashSchema.safeParse(user.pinHash);
      return pin.success ? [{ userId, pin: pin.data }] : [];
    });
  }
}
