import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { MEDIA_TYPE, type MediaCreated, type Session } from '@kids-chores/contracts';
import { CurrentSession } from '../identity';
import { MEDIA_CACHE_CONTROL } from './constants';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post()
  create(@CurrentSession() session: Session, @Body() body: unknown): Promise<MediaCreated> {
    return this.media.create(session, body);
  }

  @Get(':id')
  async read(
    @CurrentSession() session: Session,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<Buffer> {
    const body = await this.media.read(session, id);
    reply.header('content-type', MEDIA_TYPE).header('cache-control', MEDIA_CACHE_CONTROL);
    return body;
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentSession() session: Session, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.media.remove(session, id);
  }
}
