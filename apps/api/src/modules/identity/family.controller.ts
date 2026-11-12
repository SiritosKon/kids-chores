import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { FamilyInvite, FamilyResponse, Session } from '@kids-chores/contracts';
import { AuthRateLimit } from '../../platform/rate-limit';
import { ContactRequestDto } from './dto';
import { FamilyService } from './family.service';
import { CurrentSession } from './lib';
import { SessionsService } from './sessions.service';

@Controller('family')
export class FamilyController {
  constructor(
    private readonly family: FamilyService,
    private readonly sessions: SessionsService
  ) {}

  @Get()
  read(@CurrentSession() session: Session): Promise<FamilyResponse> {
    return this.family.family(session);
  }

  @AuthRateLimit()
  @Post('invites')
  invite(@CurrentSession() session: Session, @Body() body: ContactRequestDto): Promise<FamilyInvite> {
    return this.family.invite(session, body.contact);
  }

  @Delete('invites/:id')
  @HttpCode(204)
  dropInvite(@CurrentSession() session: Session, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.family.dropInvite(session, id);
  }

  @Post('invites/:id/accept')
  @HttpCode(204)
  accept(@CurrentSession() session: Session, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.family.acceptInvite(session, id);
  }

  @AuthRateLimit()
  @Post('requests')
  @HttpCode(202)
  request(@CurrentSession() session: Session, @Body() body: ContactRequestDto): Promise<void> {
    return this.family.requestToJoin(session, body.contact);
  }

  @Post('requests/:id/approve')
  @HttpCode(204)
  approve(@CurrentSession() session: Session, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.family.approve(session, id);
  }

  @Delete('requests/:id')
  @HttpCode(204)
  decline(@CurrentSession() session: Session, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.family.decline(session, id);
  }

  @Delete('members/:userId')
  @HttpCode(204)
  remove(@CurrentSession() session: Session, @Param('userId', ParseUUIDPipe) userId: string): Promise<void> {
    return this.family.removeMember(session, userId);
  }

  @Post('leave')
  @HttpCode(204)
  async leave(@CurrentSession() session: Session, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    await this.family.leave(session);
    this.sessions.clearCookie(reply);
  }
}
