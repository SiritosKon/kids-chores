import { createCatalogue } from '@/shared/api/catalogue';
import { newIdentity } from '@/shared/api/ids';
import type { RowIdentity } from '@/shared/api/types';
import { childSchema } from '../model/schema';
import type { Child, ChildGoal } from '../model/types';
import type { ChildDraft } from './types';

export const childrenCatalogue = createCatalogue<Child>('children', (rows) =>
  childSchema.array().parse(rows)
);

export const createChild = async (draft: ChildDraft, { id, at }: RowIdentity = newIdentity()): Promise<Child> => {
  const child: Child = {
    ...draft,
    id,
    order: await childrenCatalogue.nextOrder(),
    active: true,
    createdAt: at,
    updatedAt: at,
  };
  await childrenCatalogue.put(child);
  return child;
};

export const updateChild = (childId: string, draft: ChildDraft): Promise<void> =>
  childrenCatalogue.update(childId, draft);

export const setChildGoal = (childId: string, goal: ChildGoal | undefined): Promise<void> =>
  childrenCatalogue.update(childId, { goal });

export const archiveChild = (childId: string): Promise<void> => childrenCatalogue.archive(childId);
