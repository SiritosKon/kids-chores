import { Body, Controller, HttpCode, Inject, NotFoundException, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { Public } from '../../platform/http';
import { AuthRateLimit } from '../../platform/rate-limit';
import { AccountsService } from './accounts.service';
import { EMAIL_PROVIDER } from './constants';
import { EmailCodeRequestDto, EmailSignInDto } from './dto';
import { EmailCodesService } from './email-codes.service';
import { canonicalContact, contactHash, subjectHash } from './lib';
import { PasswordsService } from './passwords.service';
import { SessionsService } from './sessions.service';

@Controller('auth/email')
export class EmailAuthController {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly codes: EmailCodesService,
    private readonly accounts: AccountsService,
    private readonly sessions: SessionsService,
    private readonly passwords: PasswordsService
  ) {}

  @Public()
  @AuthRateLimit()
  @Post('start')
  @HttpCode(204)
  async start(@Body() body: EmailCodeRequestDto, @Req() request: FastifyRequest): Promise<void> {
    this.requireEnabled();
    const { hash } = contactHash(this.config.AUTH_PEPPER, { kind: 'email', value: body.email });
    await this.codes.send('signIn', hash, body.email, body.locale, request.ip);
  }

  @Public()
  @AuthRateLimit()
  @Post('verify')
  @HttpCode(204)
  async verify(
    @Body() body: EmailSignInDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<void> {
    this.requireEnabled();
    const pepper = this.config.AUTH_PEPPER;
    const contact = contactHash(pepper, { kind: 'email', value: body.email });
    await this.codes.check('signIn', contact.hash, body.code);
    const subject = subjectHash(pepper, EMAIL_PROVIDER, canonicalContact({ kind: 'email', value: body.email }));
    const signedIn = await this.accounts.signIn(EMAIL_PROVIDER, subject, { contacts: [contact], linkable: [contact] });
    const token = await this.sessions.start(request, reply, signedIn);
    await this.passwords.grant(signedIn.userId, token);
  }

  private requireEnabled(): void {
    if (!this.config.EMAIL_SIGN_IN) {
      throw new NotFoundException();
    }
  }
}
