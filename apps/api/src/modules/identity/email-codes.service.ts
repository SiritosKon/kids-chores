import {
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
import type { MailLocale } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { MailService } from '../../platform/mail';
import { VALKEY } from '../../platform/valkey';
import { EMAIL_CODE_ATTEMPTS, EMAIL_CODE_RESEND_SECONDS, EMAIL_CODE_TTL_SECONDS } from './constants';
import { emailCodeHash, emailCodeKey, emailCodeMail, emailCodeSentKey, newEmailCode, sameHash } from './lib';
import { storedEmailCodeSchema } from './schema';
import type { EmailCodePurpose } from './types';

@Injectable()
export class EmailCodesService {
  private readonly logger = new Logger(EmailCodesService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(VALKEY) private readonly valkey: Redis,
    private readonly mail: MailService
  ) {}

  async send(purpose: EmailCodePurpose, subject: string, email: string, locale: MailLocale): Promise<void> {
    const sent = emailCodeSentKey(purpose, subject);
    if ((await this.valkey.set(sent, '1', 'EX', EMAIL_CODE_RESEND_SECONDS, 'NX')) !== 'OK') {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    const code = newEmailCode();
    const key = emailCodeKey(purpose, subject);
    await this.valkey
      .multi()
      .del(key)
      .hset(key, { hash: emailCodeHash(this.config.AUTH_PEPPER, purpose, subject, code), attempts: 0 })
      .expire(key, EMAIL_CODE_TTL_SECONDS)
      .exec();
    try {
      await this.mail.send({ to: email, ...emailCodeMail(purpose, locale, code) });
    } catch (error) {
      await this.valkey.del(key, sent);
      this.logger.warn(`${purpose} code mail failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      throw new ServiceUnavailableException();
    }
  }

  async check(purpose: EmailCodePurpose, subject: string, code: string): Promise<void> {
    const key = emailCodeKey(purpose, subject);
    const stored = storedEmailCodeSchema.safeParse(await this.valkey.hgetall(key));
    if (!stored.success) {
      throw new GoneException();
    }
    if (sameHash(stored.data.hash, emailCodeHash(this.config.AUTH_PEPPER, purpose, subject, code))) {
      await this.valkey.del(key);
      return;
    }
    if ((await this.valkey.hincrby(key, 'attempts', 1)) >= EMAIL_CODE_ATTEMPTS) {
      await this.valkey.del(key);
      throw new GoneException();
    }
    throw new UnprocessableEntityException();
  }
}
