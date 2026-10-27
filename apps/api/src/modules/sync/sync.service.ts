import { Injectable } from '@nestjs/common';
import {
  syncFieldsSchema,
  syncKindSchema,
  type Session,
  type SyncMutation,
  type SyncPullQuery,
  type SyncPullResponse,
  type SyncPushResponse,
  type SyncRecord,
} from '@kids-chores/contracts';
import type { FamilyRecord } from '../../generated/prisma/client';
import { PrismaService } from '../../platform/database';
import { OutboxService } from '../../platform/outbox';
import { FAMILY_CHANGED_EVENT, FAMILY_CHANGED_VERSION } from './constants';
import { deletedAt, mergeRecord } from './lib';
import { fieldChangedAtSchema, storedRecordSchema } from './schema';
import type { StoredRecord } from './types';

const toStored = (row: FamilyRecord): StoredRecord =>
  storedRecordSchema.parse({ data: row.data, fieldChangedAt: row.fieldChangedAt, deleted: row.deletedAt !== null });

const toSyncRecord = (row: FamilyRecord): SyncRecord => ({
  kind: syncKindSchema.parse(row.kind),
  id: row.id,
  data: syncFieldsSchema.parse(row.data),
  deleted: row.deletedAt !== null,
  changeNumber: Number(row.changeNumber),
});

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService
  ) {}

  push(session: Session, mutations: readonly SyncMutation[]): Promise<SyncPushResponse> {
    const { familyId } = session;
    return this.prisma.inFamily(familyId, async (tx) => {
      const [family] = await tx.$queryRaw<{ last_change_number: bigint }[]>`
        SELECT last_change_number FROM core.families WHERE id = ${familyId}::uuid FOR UPDATE`;
      let changeNumber = Number(family?.last_change_number ?? 0);
      let applied = 0;
      const now = Date.now();
      for (const mutation of mutations) {
        const fresh = await tx.processedMutation.createMany({
          data: [{ familyId, mutationId: mutation.mutationId }],
          skipDuplicates: true,
        });
        if (fresh.count === 0) {
          continue;
        }
        const key = { familyId, kind: mutation.kind, id: mutation.id };
        const current = await tx.familyRecord.findUnique({ where: { familyId_kind_id: key } });
        const merged = mergeRecord(current ? toStored(current) : null, mutation, now);
        changeNumber += 1;
        applied += 1;
        const row = {
          data: merged.data,
          fieldChangedAt: fieldChangedAtSchema.parse(merged.fieldChangedAt),
          deletedAt: deletedAt(merged),
          changeNumber: BigInt(changeNumber),
        };
        await tx.familyRecord.upsert({
          where: { familyId_kind_id: key },
          create: { ...key, ...row },
          update: row,
        });
      }
      if (applied > 0) {
        await tx.family.update({ where: { id: familyId }, data: { lastChangeNumber: BigInt(changeNumber) } });
        await this.outbox.record(tx, {
          type: FAMILY_CHANGED_EVENT,
          version: FAMILY_CHANGED_VERSION,
          familyId,
          payload: { changeNumber, applied },
        });
      }
      return { applied, lastChangeNumber: changeNumber };
    });
  }

  pull(session: Session, query: SyncPullQuery): Promise<SyncPullResponse> {
    const { familyId } = session;
    return this.prisma.inFamily(familyId, async (tx) => {
      const rows = await tx.familyRecord.findMany({
        where: { familyId, changeNumber: { gt: BigInt(query.since) } },
        orderBy: { changeNumber: 'asc' },
        take: query.limit + 1,
      });
      const page = rows.slice(0, query.limit);
      const last = page.at(-1);
      return {
        records: page.map(toSyncRecord),
        lastChangeNumber: last ? Number(last.changeNumber) : query.since,
        more: rows.length > query.limit,
      };
    });
  }
}
