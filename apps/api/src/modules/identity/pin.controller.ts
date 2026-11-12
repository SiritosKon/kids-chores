import { Body, ConflictException, Controller, HttpCode, Inject, Post, UnprocessableEntityException } from '@nestjs/common';
import type { Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { AuthRateLimit } from '../../platform/rate-limit';
import { EmailCodeCheckDto, EmailCodeRequestDto } from './dto';
import { EmailCodesService } from './email-codes.service';
import { contactHash, CurrentSession } from './lib';

@Controller('pin')
export class PinController {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly prisma: PrismaService,
    private readonly codes: EmailCodesService
  ) {}

  @AuthRateLimit()
  @Post('code')
  @HttpCode(204)
  async send(@CurrentSession() session: Session, @Body() body: EmailCodeRequestDto): Promise<void> {
    const emails = await this.prisma.userContact.count({ where: { userId: session.userId, kind: 'email' } });
    if (emails === 0) {
      throw new ConflictException();
    }
    const { hash } = contactHash(this.config.AUTH_PEPPER, { kind: 'email', value: body.email });
    const owner = await this.prisma.userContact.findUnique({ where: { kind_hash: { kind: 'email', hash } } });
    if (owner?.userId !== session.userId) {
      throw new UnprocessableEntityException();
    }
    await this.codes.send('pin', session.userId, body.email, body.locale);
  }

  @AuthRateLimit()
  @Post('code/check')
  @HttpCode(204)
  check(@CurrentSession() session: Session, @Body() body: EmailCodeCheckDto): Promise<void> {
    return this.codes.check('pin', session.userId, body.code);
  }
}
