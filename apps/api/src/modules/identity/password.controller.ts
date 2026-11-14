import { Body, Controller, HttpCode, Inject, NotFoundException, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { Public } from '../../platform/http';
import { AuthRateLimit } from '../../platform/rate-limit';
import { AccountsService } from './accounts.service';
import { PasswordSignInDto } from './dto';
import { PasswordsService } from './passwords.service';
import { SessionsService } from './sessions.service';

@Controller('auth/password')
export class PasswordController {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly passwords: PasswordsService,
    private readonly accounts: AccountsService,
    private readonly sessions: SessionsService
  ) {}

  @Public()
  @AuthRateLimit()
  @Post()
  @HttpCode(204)
  async signIn(
    @Body() body: PasswordSignInDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<void> {
    if (!this.config.EMAIL_SIGN_IN) {
      throw new NotFoundException();
    }
    const userId = await this.passwords.signIn(body.email, body.password);
    if (request.authSession?.userId !== userId) {
      await this.sessions.start(request, reply, await this.accounts.addDevice(userId));
    }
  }
}
