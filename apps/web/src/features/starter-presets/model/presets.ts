import { i18n } from '@/shared/i18n';
import { todayKey } from '@/shared/lib/date';
import { presetIdentity } from '@/shared/api/ids';
import { childrenCatalogue, createChild } from '@/entities/child';
import { tasksCatalogue, createTask } from '@/entities/task';
import { rewardsCatalogue, createReward } from '@/entities/reward';
import { PRESET_CHILD, PRESET_REWARDS, PRESET_TASKS } from './constants';

const isEmpty = async (): Promise<boolean> => {
  const counts = await Promise.all([childrenCatalogue.count(), tasksCatalogue.count(), rewardsCatalogue.count()]);
  return counts.every((count) => count === 0);
};

export const seedPresets = async (): Promise<void> => {
  if (!(await isEmpty())) {
    return;
  }
  const { t } = i18n.global;
  const { presetId, nameKey, ...childDraft } = PRESET_CHILD;
  await createChild({ ...childDraft, name: t(nameKey), photo: '' }, presetIdentity(presetId));
  const today = todayKey();
  for (const { presetId: taskId, nameKey: taskKey, ...draft } of PRESET_TASKS) {
    await createTask({ ...draft, name: t(taskKey) }, today, {}, presetIdentity(taskId));
  }
  for (const { presetId: rewardId, nameKey: rewardKey, ...draft } of PRESET_REWARDS) {
    await createReward({ ...draft, name: t(rewardKey) }, presetIdentity(rewardId));
  }
};
