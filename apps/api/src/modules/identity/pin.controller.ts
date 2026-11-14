import { Body, ConflictException, Controller, HttpCode, Inject, Post, Put, Req, UnprocessableEntityException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { AuthRateLimit } from '../../platform/rate-limit';
import { EmailCodeCheckDto, EmailCodeRequestDto, PinCheckDto, SetPinDto } from './dto';
import { EmailCodesService } from './email-codes.service';
import { contactHash, CurrentSession } from './lib';
import { PinsService } from './pins.service';

@Controller('pin')
export class PinController {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly prisma: PrismaService,
    private readonly codes: EmailCodesService,
    private readonly pins: PinsService
  ) {}

  @Put()
  @HttpCode(204)
  set(@CurrentSession() session: Session, @Body() body: SetPinDto): Promise<void> {
    return this.pins.set(session, body);
  }

  @AuthRateLimit()
  @Post('check')
  @HttpCode(204)
  checkPin(@CurrentSession() session: Session, @Body() body: PinCheckDto): Promise<void> {
    return this.pins.checkPin(session, body.pin);
  }

  @AuthRateLimit()
  @Post('code')
  @HttpCode(204)
  async send(
    @CurrentSession() session: Session,
    @Body() body: EmailCodeRequestDto,
    @Req() request: FastifyRequest
  ): Promise<void> {
    const emails = await this.prisma.userContact.count({ where: { userId: session.userId, kind: 'email' } });
    if (emails === 0) {
      throw new ConflictException();
    }
    const { hash } = contactHash(this.config.AUTH_PEPPER, { kind: 'email', value: body.email });
    const owner = await this.prisma.userContact.findUnique({ where: { kind_hash: { kind: 'email', hash } } });
    if (owner?.userId !== session.userId) {
      throw new UnprocessableEntityException();
    }
    await this.codes.send('pin', session.userId, body.email, body.locale, request.ip);
  }

  @AuthRateLimit()
  @Post('code/check')
  @HttpCode(204)
  async check(@CurrentSession() session: Session, @Body() body: EmailCodeCheckDto): Promise<void> {
    await this.codes.check('pin', session.userId, body.code);
    await this.pins.grant(session.userId);
  }
}
