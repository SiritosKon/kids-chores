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
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AUTH_PROVIDERS, type AuthProvider, type Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { Public } from '../../platform/http';
import { AuthRateLimit } from '../../platform/rate-limit';
import { AccountsService } from './accounts.service';
import { OidcService } from './oidc.service';
import { PasskeyLoginDto, PasskeyRegisterDto } from './dto';
import { PinsService } from './pins.service';
import { authIntentSchema } from './schema';
import { AUTH_STATE_COOKIE } from './constants';
import {
  authStateCookieOptions,
  contactHash,
  CurrentSession,
  failedSignInUrl,
  freshSignIn,
  homeUrl,
  linkedUrl,
  pinResetUrl,
  publicOrigin,
  subjectHash,
} from './lib';
import { PasskeysService } from './passkeys.service';
import { SessionsService } from './sessions.service';
import type { AuthState, PasskeyLoginOptions, PasskeyRegisterOptions, ProviderIdentity } from './types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly accounts: AccountsService,
    private readonly sessions: SessionsService,
    private readonly oidc: OidcService,
    private readonly passkeys: PasskeysService,
    private readonly pins: PinsService
  ) {}

  @Public()
  @AuthRateLimit()
  @Get(':provider/start')
  async start(
    @Param('provider') provider: string,
    @Query('intent') rawIntent: unknown,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply
  ): Promise<FastifyReply> {
    const known = this.requireProvider(provider);
    const intent = authIntentSchema.parse(rawIntent);
    const userId = request.authSession?.userId;
    if (intent === 'reauth' && !userId) {
      return reply.redirect(pinResetUrl(this.config, 'failed'), 302);
    }
    if (intent === 'link' && (!userId || !(await this.pins.stepUpReady(userId)))) {
      return reply.redirect(linkedUrl(this.config, 'failed'), 302);
    }
    const { url, state } = await this.oidc.start(known, intent, userId);
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
    const callbackAt = new URL(request.url, publicOrigin(this.config));
    let stored: AuthState | null = null;
    try {
      stored = await this.oidc.takeState(known, callbackAt, browserState);
      const identity = await this.oidc.finish(known, callbackAt, stored);
      if (stored.intent === 'reauth') {
        return reply.redirect(pinResetUrl(this.config, await this.reauth(known, identity, stored)), 302);
      }
      const pepper = this.config.AUTH_PEPPER;
      const subject = subjectHash(pepper, known, identity.subject);
      const profile = {
        name: identity.name,
        contacts: identity.contacts.map((contact) => contactHash(pepper, contact)),
        linkable: identity.linkable.map((contact) => contactHash(pepper, contact)),
      };
      if (stored.intent === 'link') {
        const outcome = stored.userId ? await this.accounts.link(known, subject, stored.userId, profile) : 'taken';
        return reply.redirect(linkedUrl(this.config, outcome === 'linked' ? known : 'taken'), 302);
      }
      const signedIn = await this.accounts.signIn(known, subject, profile);
      await this.sessions.start(request, reply, signedIn);
      return reply.redirect(homeUrl(this.config, known, identity.picture), 302);
    } catch (error) {
      this.logger.warn(`${known} ${stored?.intent ?? 'sign-in'} failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      return reply.redirect(this.failedUrl(known, stored), 302);
    }
  }

  private failedUrl(provider: AuthProvider, stored: AuthState | null): string {
    if (stored?.intent === 'reauth') {
      return pinResetUrl(this.config, 'failed');
    }
    return stored?.intent === 'link' ? linkedUrl(this.config, 'failed') : failedSignInUrl(this.config, provider);
  }

  private async reauth(provider: AuthProvider, identity: ProviderIdentity, stored: AuthState): Promise<'granted' | 'failed'> {
    const { userId } = stored;
    const subject = subjectHash(this.config.AUTH_PEPPER, provider, identity.subject);
    const account = await this.accounts.findAccount(provider, subject);
    if (!userId || account?.userId !== userId || !freshSignIn(stored.startedAt, identity.authTime)) {
      return 'failed';
    }
    await this.pins.grant(userId);
    return 'granted';
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
  @AuthRateLimit()
  @Post('passkey/login/options')
  loginOptions(): Promise<PasskeyLoginOptions> {
    return this.passkeys.loginOptions();
  }

  @Public()
  @AuthRateLimit()
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
