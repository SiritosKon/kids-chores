import { createCatalogue } from '@/shared/api/catalogue';
import { childSchema } from '../model/schema';
import type { Child } from '../model/types';
import type { ChildDraft } from './types';

export const childrenCatalogue = createCatalogue<Child>('children', (rows) =>
  childSchema.array().parse(rows)
);

export const createChild = async (draft: ChildDraft): Promise<Child> => {
  const now = Date.now();
  const child: Child = {
    ...draft,
    id: crypto.randomUUID(),
    order: await childrenCatalogue.nextOrder(),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await childrenCatalogue.put(child);
  return child;
};

export const updateChild = (childId: string, draft: ChildDraft): Promise<void> =>
  childrenCatalogue.update(childId, draft);

export const archiveChild = (childId: string): Promise<void> => childrenCatalogue.archive(childId);
