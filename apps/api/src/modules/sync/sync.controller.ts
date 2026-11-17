import { Body, Controller, Get, Headers, HttpCode, Post, Query } from '@nestjs/common';
import { FAMILY_HEADER, type Session, type SyncPullResponse, type SyncPushResponse } from '@kids-chores/contracts';
import { CurrentSession } from '../identity';
import { SyncPullQueryDto, SyncPushDto } from './dto';
import { requireSameFamily } from './lib';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('push')
  @HttpCode(200)
  push(
    @CurrentSession() session: Session,
    @Headers(FAMILY_HEADER) family: string | undefined,
    @Body() body: SyncPushDto
  ): Promise<SyncPushResponse> {
    requireSameFamily(session, family);
    return this.sync.push(session, body.mutations);
  }

  @Get('pull')
  pull(
    @CurrentSession() session: Session,
    @Headers(FAMILY_HEADER) family: string | undefined,
    @Query() query: SyncPullQueryDto
  ): Promise<SyncPullResponse> {
    requireSameFamily(session, family);
    return this.sync.pull(session, query);
  }
}
