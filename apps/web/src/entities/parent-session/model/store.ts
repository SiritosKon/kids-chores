import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useParentSessionStore = defineStore('parent-session', () => {
  const active = ref(false);

  const unlock = (): void => {
    active.value = true;
  };

  const logout = (): void => {
    active.value = false;
  };

  return { active, unlock, logout };
});
