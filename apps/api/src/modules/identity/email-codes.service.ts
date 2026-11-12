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
import {
  CODE_MAILS_PER_ADDRESS,
  CODE_MAILS_PER_DAY_TOTAL,
  CODE_MAILS_PER_IP,
  CHECK_CODE_SCRIPT,
  EMAIL_CODE_ATTEMPTS,
  EMAIL_CODE_RESEND_SECONDS,
  EMAIL_CODE_TTL_SECONDS,
} from './constants';
import { DailyLimitsService } from './daily-limits.service';
import { emailCodeHash, emailCodeKey, emailCodeMail, emailCodeSentKey, newEmailCode, sameHash, subjectHash } from './lib';
import { checkedCodeSchema } from './schema';
import type { DailyLimit, EmailCodePurpose } from './types';

@Injectable()
export class EmailCodesService {
  private readonly logger = new Logger(EmailCodesService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(VALKEY) private readonly valkey: Redis,
    private readonly mail: MailService,
    private readonly limits: DailyLimitsService
  ) {}

  async send(purpose: EmailCodePurpose, subject: string, email: string, locale: MailLocale, ip: string): Promise<void> {
    const sent = emailCodeSentKey(purpose, subject);
    if ((await this.valkey.set(sent, '1', 'EX', EMAIL_CODE_RESEND_SECONDS, 'NX')) !== 'OK') {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    const limits = this.mailLimits(purpose, subject, ip);
    try {
      await this.limits.reserve(limits);
    } catch (error) {
      await this.valkey.del(sent);
      throw error;
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
      await this.limits.release(limits);
      await this.valkey.del(key, sent);
      this.logger.warn(`${purpose} code mail failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      throw new ServiceUnavailableException();
    }
  }

  private mailLimits(purpose: EmailCodePurpose, subject: string, ip: string): DailyLimit[] {
    return [
      { name: `mail:code:${purpose}:${subject}`, perDay: CODE_MAILS_PER_ADDRESS },
      { name: `mail:code:ip:${subjectHash(this.config.AUTH_PEPPER, 'ip', ip)}`, perDay: CODE_MAILS_PER_IP },
      { name: `mail:code:${purpose}:all`, perDay: CODE_MAILS_PER_DAY_TOTAL },
    ];
  }

  async check(purpose: EmailCodePurpose, subject: string, code: string): Promise<void> {
    const key = emailCodeKey(purpose, subject);
    const checked = checkedCodeSchema.safeParse(await this.valkey.eval(CHECK_CODE_SCRIPT, 1, key, EMAIL_CODE_ATTEMPTS));
    if (!checked.success) {
      throw new GoneException();
    }
    const [hash, attempts] = checked.data;
    if (sameHash(hash, emailCodeHash(this.config.AUTH_PEPPER, purpose, subject, code))) {
      await this.valkey.del(key);
      return;
    }
    if (attempts >= EMAIL_CODE_ATTEMPTS) {
      await this.valkey.del(key);
      throw new GoneException();
    }
    throw new UnprocessableEntityException();
  }
}
