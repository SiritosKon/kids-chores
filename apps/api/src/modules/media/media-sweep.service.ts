import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../platform/database';
import { FAMILY_MEDIA_PREFIX, familyMediaPrefix, mediaLocation, StorageService } from '../../platform/storage';
import { MEDIA_SWEEP_MS } from './constants';

@Injectable()
export class MediaSweepService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaSweepService.name);
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      this.sweep().catch((error: unknown) => {
        this.logger.warn(`media sweep failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      });
    }, MEDIA_SWEEP_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  async sweep(): Promise<void> {
    const byFamily = new Map<string, string[]>();
    for (const key of await this.storage.list(FAMILY_MEDIA_PREFIX)) {
      const location = mediaLocation(key);
      if (location) {
        byFamily.set(location.familyId, [...(byFamily.get(location.familyId) ?? []), key]);
      }
    }
    for (const [familyId, keys] of byFamily) {
      const kept = await this.prisma.inFamily(familyId, async (tx) =>
        (await tx.family.count({ where: { id: familyId } })) === 0
          ? null
          : new Set((await tx.media.findMany({ where: { familyId }, select: { id: true } })).map(({ id }) => id))
      );
      if (kept === null) {
        await this.storage.removePrefix(familyMediaPrefix(familyId));
        continue;
      }
      for (const key of keys) {
        if (!kept.has(mediaLocation(key)?.mediaId ?? '')) {
          await this.storage.remove(key);
        }
      }
    }
  }
}
