import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { pinHashSchema, type MemberPin, type PinHash, type Session, type SetPinRequest } from '@kids-chores/contracts';
import { PrismaService } from '../../platform/database';
import { VALKEY } from '../../platform/valkey';
import {
  PIN_GRANT_TTL_SECONDS,
  STEP_UP_FAILS_LIMIT,
  STEP_UP_FAILS_WINDOW_SECONDS,
  STEP_UP_TTL_SECONDS,
} from './constants';
import { pinDigest, pinGrantKey, sameHash, stepUpFailsKey, stepUpKey } from './lib';

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

  async checkPin(session: Session, pin: string): Promise<void> {
    const fails = stepUpFailsKey(session.userId);
    const tries = await this.valkey.incr(fails);
    if (tries === 1) {
      await this.valkey.expire(fails, STEP_UP_FAILS_WINDOW_SECONDS);
    }
    if (tries > STEP_UP_FAILS_LIMIT) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    const stored = await this.ownPin(session.userId);
    if (!stored || !sameHash(await pinDigest(pin, stored), stored.hash, 'base64')) {
      throw new ForbiddenException();
    }
    await this.valkey.multi().del(fails).set(stepUpKey(session.userId), '1', 'EX', STEP_UP_TTL_SECONDS).exec();
  }

  async stepUpReady(userId: string): Promise<boolean> {
    return (await this.ownPin(userId)) === null || (await this.valkey.exists(stepUpKey(userId))) === 1;
  }

  async requireStepUp(userId: string): Promise<void> {
    if (!(await this.stepUpReady(userId))) {
      throw new ForbiddenException();
    }
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

  private async ownPin(userId: string): Promise<PinHash | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { pinHash: true } });
    const stored = pinHashSchema.safeParse(user?.pinHash);
    return stored.success ? stored.data : null;
  }
}
