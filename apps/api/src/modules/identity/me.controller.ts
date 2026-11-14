import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MeResponse, Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { AuthRateLimit } from '../../platform/rate-limit';
import { AccountsService } from './accounts.service';
import { EMAIL_PROVIDER } from './constants';
import { EmailCodeRequestDto, EmailSignInDto, UpdateMeDto } from './dto';
import { EmailCodesService } from './email-codes.service';
import { canonicalContact, contactHash, CurrentSession, emailLinkSubject, subjectHash } from './lib';
import { PinsService } from './pins.service';
import { SessionsService } from './sessions.service';

@Controller('me')
export class MeController {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly accounts: AccountsService,
    private readonly sessions: SessionsService,
    private readonly codes: EmailCodesService,
    private readonly pins: PinsService
  ) {}

  @Get()
  read(@CurrentSession() session: Session): Promise<MeResponse> {
    return this.accounts.me(session);
  }

  @Patch()
  @HttpCode(204)
  update(@CurrentSession() session: Session, @Body() body: UpdateMeDto): Promise<void> {
    return this.accounts.rename(session, body.name);
  }

  @AuthRateLimit()
  @Post('email/start')
  @HttpCode(204)
  async startEmail(
    @CurrentSession() session: Session,
    @Body() body: EmailCodeRequestDto,
    @Req() request: FastifyRequest
  ): Promise<void> {
    await this.requireEmailLink(session);
    const { hash } = contactHash(this.config.AUTH_PEPPER, { kind: 'email', value: body.email });
    await this.codes.send('link', emailLinkSubject(session.userId, hash), body.email, body.locale, request.ip);
  }

  @AuthRateLimit()
  @Post('email/verify')
  @HttpCode(204)
  async verifyEmail(@CurrentSession() session: Session, @Body() body: EmailSignInDto): Promise<void> {
    await this.requireEmailLink(session);
    const pepper = this.config.AUTH_PEPPER;
    const contact = contactHash(pepper, { kind: 'email', value: body.email });
    await this.codes.check('link', emailLinkSubject(session.userId, contact.hash), body.code);
    const subject = subjectHash(pepper, EMAIL_PROVIDER, canonicalContact({ kind: 'email', value: body.email }));
    const outcome = await this.accounts.link(EMAIL_PROVIDER, subject, session.userId, { contacts: [contact], linkable: [contact] });
    if (outcome === 'taken') {
      throw new ConflictException();
    }
  }

  @Delete()
  @HttpCode(204)
  async remove(@CurrentSession() session: Session, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    const { familyDropped } = await this.accounts.remove(session);
    if (familyDropped) {
      await this.sessions.endFamily(session.familyId, reply);
      return;
    }
    await this.sessions.endUser(session.familyId, session.userId);
    this.sessions.clearCookie(reply);
  }

  private async requireEmailLink(session: Session): Promise<void> {
    if (!this.config.EMAIL_SIGN_IN) {
      throw new NotFoundException();
    }
    await this.pins.requireStepUp(session.userId);
  }
}
