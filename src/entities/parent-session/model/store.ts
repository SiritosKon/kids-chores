import { ref } from 'vue';
import { defineStore } from 'pinia';
import { PARENT_PASSWORD } from '../config/password';

export const useParentSessionStore = defineStore('parent-session', () => {
  const active = ref(false);

  function login(password: string): boolean {
    if (password !== PARENT_PASSWORD) {
      return false;
    }
    active.value = true;
    return true;
  }

  function logout(): void {
    active.value = false;
  }

  return { active, login, logout };
});
