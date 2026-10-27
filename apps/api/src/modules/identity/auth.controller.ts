import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AUTH_PROVIDERS, type AuthProvider, type Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { Public } from '../../platform/http';
import { AccountsService } from './accounts.service';
import { PasskeyLoginDto, PasskeyRegisterDto } from './dto';
import { GoogleService } from './google.service';
import { AUTH_STATE_COOKIE } from './constants';
import { accountUrl, authStateCookieOptions, CurrentSession, publicOrigin, subjectHash } from './lib';
import { PasskeysService } from './passkeys.service';
import { SessionsService } from './sessions.service';
import type { PasskeyLoginOptions, PasskeyRegisterOptions } from './types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly accounts: AccountsService,
    private readonly sessions: SessionsService,
    private readonly google: GoogleService,
    private readonly passkeys: PasskeysService
  ) {}

  @Public()
  @Get(':provider/start')
  async start(@Param('provider') provider: string, @Res() reply: FastifyReply): Promise<FastifyReply> {
    this.requireProvider(provider);
    const { url, state } = await this.google.start();
    reply.setCookie(AUTH_STATE_COOKIE, state, authStateCookieOptions(this.config));
    return reply.redirect(url, 302);
  }

  @Public()
  @Get(':provider/callback')
  async callback(
    @Param('provider') provider: string,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply
  ): Promise<FastifyReply> {
    const known = this.requireProvider(provider);
    const browserState = request.cookies[AUTH_STATE_COOKIE];
    reply.clearCookie(AUTH_STATE_COOKIE, { path: authStateCookieOptions(this.config).path });
    try {
      const subject = await this.google.finish(new URL(request.url, publicOrigin(this.config)), browserState);
      const signedIn = await this.accounts.signIn(known, subjectHash(this.config.AUTH_PEPPER, known, subject));
      await this.sessions.start(request, reply, signedIn);
      return reply.redirect(accountUrl(this.config), 302);
    } catch (error) {
      this.logger.warn(`${known} sign-in failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      return reply.redirect(accountUrl(this.config, known), 302);
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    await this.sessions.end(request, reply);
  }

  @Post('passkey/register/options')
  registerOptions(@CurrentSession() session: Session): Promise<PasskeyRegisterOptions> {
    return this.passkeys.registrationOptions(session);
  }

  @Post('passkey/register')
  @HttpCode(204)
  register(@CurrentSession() session: Session, @Body() body: PasskeyRegisterDto): Promise<void> {
    return this.passkeys.register(session, body.response);
  }

  @Public()
  @Post('passkey/login/options')
  loginOptions(): Promise<PasskeyLoginOptions> {
    return this.passkeys.loginOptions();
  }

  @Public()
  @Post('passkey/login')
  @HttpCode(204)
  async login(
    @Body() body: PasskeyLoginDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<void> {
    const userId = await this.passkeys.verifyLogin(body.flowId, body.response);
    if (request.authSession?.userId !== userId) {
      await this.sessions.start(request, reply, await this.accounts.addDevice(userId));
    }
  }

  @Delete('passkey/:id')
  @HttpCode(204)
  remove(@CurrentSession() session: Session, @Param('id') id: string): Promise<void> {
    return this.passkeys.remove(session, id);
  }

  private requireProvider(provider: string): AuthProvider {
    const known = AUTH_PROVIDERS.find((item) => item === provider);
    if (!known || !this.config.AUTH_PROVIDERS.includes(known)) {
      throw new NotFoundException();
    }
    return known;
  }
}
