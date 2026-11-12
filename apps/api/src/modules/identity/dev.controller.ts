import { Body, Controller, HttpCode, Inject, NotFoundException, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { Public } from '../../platform/http';
import { AuthRateLimit } from '../../platform/rate-limit';
import { AccountsService } from './accounts.service';
import { DEV_PROVIDER } from './constants';
import { DevLoginDto } from './dto';
import { contactHash, subjectHash } from './lib';
import { SessionsService } from './sessions.service';

@Controller('dev')
export class DevController {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly accounts: AccountsService,
    private readonly sessions: SessionsService
  ) {}

  @Public()
  @AuthRateLimit()
  @Post('login')
  @HttpCode(204)
  async login(
    @Body() body: DevLoginDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<void> {
    if (!this.config.DEV_LOGIN) {
      throw new NotFoundException();
    }
    const pepper = this.config.AUTH_PEPPER;
    const signedIn = await this.accounts.signIn(DEV_PROVIDER, subjectHash(pepper, DEV_PROVIDER, body.name), {
      name: body.name,
      contacts: [
        ...(body.email ? [contactHash(pepper, { kind: 'email', value: body.email })] : []),
        ...(body.phone ? [contactHash(pepper, { kind: 'phone', value: body.phone })] : []),
      ],
    });
    await this.sessions.start(request, reply, signedIn);
  }
}
