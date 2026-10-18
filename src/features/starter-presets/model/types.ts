import type { ChildDraft } from '@/entities/child';
import type { TaskDraft } from '@/entities/task';
import type { RewardDraft } from '@/entities/reward';

export interface PresetChild extends Omit<ChildDraft, 'name' | 'photo' | 'goal'> {
  nameKey: string;
}

export interface PresetTask extends Omit<TaskDraft, 'name'> {
  nameKey: string;
}

export interface PresetReward extends Omit<RewardDraft, 'name'> {
  nameKey: string;
}

export type PresetKind = 'child' | 'task' | 'reward';

export interface PresetRow {
  kind: PresetKind;
  id: string;
  nameKey: string;
}
