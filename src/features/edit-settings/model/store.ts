import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSettingsDialogStore = defineStore('settings-dialog', () => {
  const isOpen = ref(false);
  const resume = ref(false);
  const pickedRewardId = ref<string | null>(null);
  const streakDraftEnabled = ref(false);
  const saveRequests = ref(0);

  const open = (): void => {
    resume.value = false;
    pickedRewardId.value = null;
    isOpen.value = true;
  };

  const reopen = (rewardId: string | null = null): void => {
    resume.value = true;
    pickedRewardId.value = rewardId;
    isOpen.value = true;
  };

  const close = (): void => {
    isOpen.value = false;
  };

  const requestSave = (): void => {
    saveRequests.value += 1;
  };

  return { isOpen, resume, pickedRewardId, streakDraftEnabled, saveRequests, open, reopen, close, requestSave };
});
