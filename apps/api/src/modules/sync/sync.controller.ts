import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import type { Session, SyncPullResponse, SyncPushResponse } from '@kids-chores/contracts';
import { CurrentSession } from '../identity';
import { SyncPullQueryDto, SyncPushDto } from './dto';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('push')
  @HttpCode(200)
  push(@CurrentSession() session: Session, @Body() body: SyncPushDto): Promise<SyncPushResponse> {
    return this.sync.push(session, body.mutations);
  }

  @Get('pull')
  pull(@CurrentSession() session: Session, @Query() query: SyncPullQueryDto): Promise<SyncPullResponse> {
    return this.sync.pull(session, query);
  }
}
