import { ref } from 'vue';
import { defineStore } from 'pinia';
import { INVITE_TOKEN_PATTERN, type InvitePreview } from '@kids-chores/contracts';
import { acceptInvite, previewInvite } from '@/entities/account';
import { forgetInviteToken, storeInviteToken, storedInviteToken } from '../lib/inviteToken';
import type { PendingInviteState } from './types';

export const usePendingInviteStore = defineStore('pending-invite', () => {
  const token = ref<string | null>(storedInviteToken());
  const preview = ref<InvitePreview | null>(null);
  const state = ref<PendingInviteState>('idle');

  const remember = (value: string): void => {
    if (!INVITE_TOKEN_PATTERN.test(value)) {
      return;
    }
    storeInviteToken(value);
    token.value = value;
    preview.value = null;
    state.value = 'idle';
  };

  const dismiss = (): void => {
    forgetInviteToken();
    token.value = null;
    preview.value = null;
    state.value = 'idle';
  };

  const load = async (): Promise<void> => {
    const current = token.value;
    if (current === null || state.value === 'loading') {
      return;
    }
    state.value = 'loading';
    const result = await previewInvite(current);
    if (token.value !== current) {
      return;
    }
    if (result.status === 'ready') {
      preview.value = result.preview;
      state.value = 'ready';
      return;
    }
    state.value = result.status;
  };

  const accept = async (): Promise<boolean> => {
    if (token.value === null || !(await acceptInvite(token.value))) {
      return false;
    }
    dismiss();
    return true;
  };

  return { token, preview, state, remember, dismiss, load, accept };
});
