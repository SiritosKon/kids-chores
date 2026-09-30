import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { StreakMilestone } from '@/entities/settings';
import { EMPTY_STAGE_DRAFT } from './constants';
import type { StageDraft } from './types';

export const useStageDraftStore = defineStore('stage-draft', () => {
  const stageId = ref<string | null>(null);
  const draft = ref<StageDraft>({ ...EMPTY_STAGE_DRAFT });
  const resume = ref(false);

  const begin = (id: string, stage: StreakMilestone | null): void => {
    if (resume.value && stageId.value === id) {
      resume.value = false;
      return;
    }
    resume.value = false;
    stageId.value = id;
    draft.value = stage
      ? {
          days: stage.days,
          points: stage.points ?? 0,
          rewardId: stage.rewardId ?? null,
          forEveryone: stage.childIds === undefined,
          childIds: [...(stage.childIds ?? [])],
        }
      : { ...EMPTY_STAGE_DRAFT, childIds: [] };
  };

  const returnWithReward = (rewardId: string | null): void => {
    if (rewardId) {
      draft.value = { ...draft.value, rewardId };
    }
    resume.value = true;
  };

  return { stageId, draft, begin, returnWithReward };
});
