import { i18n } from '@/shared/i18n';
import { todayKey } from '@/shared/lib/date';
import { childrenCatalogue, createChild } from '@/entities/child';
import { tasksCatalogue, createTask } from '@/entities/task';
import { rewardsCatalogue, createReward } from '@/entities/reward';
import { PRESET_CHILD, PRESET_REWARDS, PRESET_TASKS } from './constants';
import type { PresetRow } from './types';

const isEmpty = async (): Promise<boolean> => {
  const counts = await Promise.all([childrenCatalogue.count(), tasksCatalogue.count(), rewardsCatalogue.count()]);
  return counts.every((count) => count === 0);
};

export const seedPresets = async (): Promise<PresetRow[]> => {
  if (!(await isEmpty())) {
    return [];
  }
  const { t } = i18n.global;
  const { nameKey, ...childDraft } = PRESET_CHILD;
  const child = await createChild({ ...childDraft, name: t(nameKey), photo: '' });
  const today = todayKey();
  const tasks: PresetRow[] = [];
  for (const { nameKey: taskKey, ...draft } of PRESET_TASKS) {
    const task = await createTask({ ...draft, name: t(taskKey) }, today);
    tasks.push({ kind: 'task', id: task.id, nameKey: taskKey });
  }
  const rewards: PresetRow[] = [];
  for (const { nameKey: rewardKey, ...draft } of PRESET_REWARDS) {
    const reward = await createReward({ ...draft, name: t(rewardKey) });
    rewards.push({ kind: 'reward', id: reward.id, nameKey: rewardKey });
  }
  return [{ kind: 'child', id: child.id, nameKey }, ...tasks, ...rewards];
};

export const renamePresets = async (rows: readonly PresetRow[]): Promise<void> => {
  const { t } = i18n.global;
  const catalogues = { child: childrenCatalogue, task: tasksCatalogue, reward: rewardsCatalogue };
  await Promise.all(rows.map((row) => catalogues[row.kind].update(row.id, { name: t(row.nameKey) })));
};
