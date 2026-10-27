import type { ChildDraft } from '@/entities/child';
import type { TaskDraft } from '@/entities/task';
import type { RewardDraft } from '@/entities/reward';

export interface PresetChild extends Omit<ChildDraft, 'name' | 'photo' | 'goal'> {
  presetId: string;
  nameKey: string;
}

export interface PresetTask extends Omit<TaskDraft, 'name'> {
  presetId: string;
  nameKey: string;
}

export interface PresetReward extends Omit<RewardDraft, 'name'> {
  presetId: string;
  nameKey: string;
}
