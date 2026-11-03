import {
  ConflictException,
  GoneException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Redis } from 'ioredis';
import type { PinCodeCheck, PinCodeRequest, Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { MailService } from '../../platform/mail';
import { VALKEY } from '../../platform/valkey';
import { PIN_CODE_ATTEMPTS, PIN_CODE_RESEND_SECONDS, PIN_CODE_TTL_SECONDS } from './constants';
import { emailHash, newPinCode, pinCodeHash, pinCodeKey, pinCodeMail, pinCodeSentKey, sameHash } from './lib';
import { storedPinCodeSchema } from './schema';

@Injectable()
export class PinCodesService {
  private readonly logger = new Logger(PinCodesService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(VALKEY) private readonly valkey: Redis,
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  async send(session: Session, { email, locale }: PinCodeRequest): Promise<void> {
    const { userId } = session;
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { emailHash: true } });
    if (!user.emailHash) {
      throw new ConflictException();
    }
    if (!sameHash(user.emailHash, emailHash(this.config.AUTH_PEPPER, email))) {
      throw new UnprocessableEntityException();
    }
    if ((await this.valkey.set(pinCodeSentKey(userId), '1', 'EX', PIN_CODE_RESEND_SECONDS, 'NX')) !== 'OK') {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    const code = newPinCode();
    const key = pinCodeKey(userId);
    await this.valkey
      .multi()
      .del(key)
      .hset(key, { hash: pinCodeHash(this.config.AUTH_PEPPER, userId, code), attempts: 0 })
      .expire(key, PIN_CODE_TTL_SECONDS)
      .exec();
    try {
      await this.mail.send({ to: email, ...pinCodeMail(locale, code) });
    } catch (error) {
      await this.valkey.del(key, pinCodeSentKey(userId));
      this.logger.warn(`pin code mail failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      throw new ServiceUnavailableException();
    }
  }

  async check(session: Session, { code }: PinCodeCheck): Promise<void> {
    const key = pinCodeKey(session.userId);
    const stored = storedPinCodeSchema.safeParse(await this.valkey.hgetall(key));
    if (!stored.success) {
      throw new GoneException();
    }
    if (sameHash(stored.data.hash, pinCodeHash(this.config.AUTH_PEPPER, session.userId, code))) {
      await this.valkey.del(key);
      return;
    }
    if ((await this.valkey.hincrby(key, 'attempts', 1)) >= PIN_CODE_ATTEMPTS) {
      await this.valkey.del(key);
      throw new GoneException();
    }
    throw new UnprocessableEntityException();
  }
}
