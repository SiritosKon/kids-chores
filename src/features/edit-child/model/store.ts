import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Child } from '@/entities/child';
import { EMPTY_CHILD_DRAFT } from './constants';
import type { ChildFormDraft } from './types';

export const useChildFormStore = defineStore('child-form', () => {
  const childId = ref<string | null>(null);
  const draft = ref<ChildFormDraft>({ ...EMPTY_CHILD_DRAFT });
  const resume = ref(false);

  const begin = (id: string, child: Child | null, carColor: string): boolean => {
    if (resume.value && childId.value === id) {
      resume.value = false;
      return true;
    }
    resume.value = false;
    childId.value = id;
    draft.value = {
      name: child?.name ?? '',
      carColor: child?.carColor ?? carColor,
      photo: child?.photo ?? '',
      goalRewardId: child?.goal?.rewardId ?? null,
      goalVariantId: child?.goal?.variantId ?? null,
    };
    return false;
  };

  const returnWithReward = (rewardId: string | null): void => {
    if (rewardId) {
      draft.value = { ...draft.value, goalRewardId: rewardId, goalVariantId: null };
    }
    resume.value = true;
  };

  return { childId, draft, begin, returnWithReward };
});
