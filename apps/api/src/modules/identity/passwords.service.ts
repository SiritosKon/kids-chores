import { createHash, randomUUID } from 'node:crypto';
import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Redis } from 'ioredis';
import type { Session, SetPasswordRequest } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { VALKEY } from '../../platform/valkey';
import {
  PASSWORD_FAILS_LIMIT,
  PASSWORD_FAILS_WINDOW_SECONDS,
  PASSWORD_GRANT_TTL_SECONDS,
  PWNED_PREFIX_LENGTH,
  PWNED_TIMEOUT_MS,
} from './constants';
import { contactHash, hashPassword, passwordFailsKey, passwordGrantKey, pwnedCount, verifyPassword } from './lib';
import { PinsService } from './pins.service';

@Injectable()
export class PasswordsService {
  private readonly logger = new Logger(PasswordsService.name);
  private readonly dummy: Promise<string>;

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(VALKEY) private readonly valkey: Redis,
    private readonly prisma: PrismaService,
    private readonly pins: PinsService
  ) {
    this.dummy = hashPassword(randomUUID());
  }

  async signIn(email: string, password: string): Promise<string> {
    const { hash } = contactHash(this.config.AUTH_PEPPER, { kind: 'email', value: email });
    const fails = passwordFailsKey(hash);
    const tries = await this.valkey.incr(fails);
    if (tries === 1) {
      await this.valkey.expire(fails, PASSWORD_FAILS_WINDOW_SECONDS);
    }
    if (tries > PASSWORD_FAILS_LIMIT) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    const holder = await this.prisma.userContact.findUnique({
      where: { kind_hash: { kind: 'email', hash } },
      select: { owned: true, user: { select: { id: true, passwordHash: true } } },
    });
    const stored = holder?.owned ? holder.user.passwordHash : null;
    const matches = await verifyPassword(password, stored ?? (await this.dummy));
    if (!holder || !stored || !matches) {
      throw new UnauthorizedException();
    }
    await this.valkey.del(fails);
    return holder.user.id;
  }

  async grant(userId: string): Promise<void> {
    await this.valkey.set(passwordGrantKey(userId), '1', 'EX', PASSWORD_GRANT_TTL_SECONDS);
  }

  async set(session: Session, { password, current }: SetPasswordRequest): Promise<boolean> {
    const owned = await this.prisma.userContact.count({ where: { userId: session.userId, kind: 'email', owned: true } });
    if (owned === 0) {
      throw new ConflictException();
    }
    if (await this.breached(password)) {
      throw new UnprocessableEntityException();
    }
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { passwordHash: true } });
    const changing = user.passwordHash !== null;
    if (!(await this.allowed(session.userId, user.passwordHash, current))) {
      throw new ForbiddenException();
    }
    await this.prisma.user.update({ where: { id: session.userId }, data: { passwordHash: await hashPassword(password) } });
    await this.valkey.del(passwordGrantKey(session.userId));
    return changing;
  }

  private async allowed(userId: string, stored: string | null, current: string | undefined): Promise<boolean> {
    if (stored !== null && current !== undefined && (await verifyPassword(current, stored))) {
      return true;
    }
    if ((await this.valkey.getdel(passwordGrantKey(userId))) !== null) {
      return true;
    }
    return stored === null && (await this.pins.stepUpReady(userId));
  }

  private async breached(password: string): Promise<boolean> {
    const base = this.config.PWNED_PASSWORDS_URL;
    if (!base) {
      return false;
    }
    const digest = createHash('sha1').update(password).digest('hex').toUpperCase();
    try {
      const response = await fetch(`${base}/${digest.slice(0, PWNED_PREFIX_LENGTH)}`, {
        headers: { 'Add-Padding': 'true' },
        signal: AbortSignal.timeout(PWNED_TIMEOUT_MS),
      });
      return response.ok && pwnedCount(await response.text(), digest.slice(PWNED_PREFIX_LENGTH)) > 0;
    } catch (error) {
      this.logger.warn(`breached password check failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      return false;
    }
  }
}
