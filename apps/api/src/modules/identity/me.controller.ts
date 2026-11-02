import { Controller, Delete, Get, HttpCode, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { MeResponse, Session } from '@kids-chores/contracts';
import { AccountsService } from './accounts.service';
import { CurrentSession } from './lib';
import { SessionsService } from './sessions.service';

@Controller('me')
export class MeController {
  constructor(
    private readonly accounts: AccountsService,
    private readonly sessions: SessionsService
  ) {}

  @Get()
  read(@CurrentSession() session: Session): Promise<MeResponse> {
    return this.accounts.me(session);
  }

  @Delete()
  @HttpCode(204)
  async remove(@CurrentSession() session: Session, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    await this.accounts.remove(session);
    await this.sessions.endFamily(session.familyId, reply);
  }
}
