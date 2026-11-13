import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { MediaCreated, Session } from '@kids-chores/contracts';
import { MEDIA_TYPE } from '@kids-chores/contracts';
import { PrismaService } from '../../platform/database';
import { mediaKey, StorageService } from '../../platform/storage';
import { MEDIA_PER_FAMILY } from './constants';
import { isJpeg } from './lib';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  async create(session: Session, body: unknown): Promise<MediaCreated> {
    if (!isJpeg(body)) {
      throw new BadRequestException();
    }
    const { familyId } = session;
    const id = randomUUID();
    await this.prisma.inFamily(familyId, async (tx) => {
      await tx.$queryRaw`SELECT id FROM core.families WHERE id = ${familyId}::uuid FOR UPDATE`;
      if ((await tx.media.count({ where: { familyId } })) >= MEDIA_PER_FAMILY) {
        throw new ConflictException();
      }
      await tx.media.create({ data: { id, familyId, bytes: body.length } });
    });
    try {
      await this.storage.put(mediaKey(familyId, id), body, MEDIA_TYPE);
    } catch (error) {
      await this.prisma.inFamily(familyId, (tx) => tx.media.deleteMany({ where: { id } }));
      throw error;
    }
    return { id };
  }

  async read(session: Session, id: string): Promise<Buffer> {
    const { familyId } = session;
    const row = await this.prisma.inFamily(familyId, (tx) => tx.media.findUnique({ where: { id } }));
    const body = row ? await this.storage.get(mediaKey(familyId, id)) : null;
    if (!body) {
      throw new NotFoundException();
    }
    return body;
  }

  async remove(session: Session, id: string): Promise<void> {
    const { familyId } = session;
    const { count } = await this.prisma.inFamily(familyId, (tx) => tx.media.deleteMany({ where: { id, familyId } }));
    if (count > 0) {
      await this.storage.remove(mediaKey(familyId, id));
    }
  }
}
