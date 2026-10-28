import { createZodDto } from 'nestjs-zod';
import { syncPullQuerySchema, syncPushRequestSchema } from '@kids-chores/contracts';

export class SyncPushDto extends createZodDto(syncPushRequestSchema) {}

export class SyncPullQueryDto extends createZodDto(syncPullQuerySchema) {}
