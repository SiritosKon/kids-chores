import { ref } from 'vue';
import { PARENT_PASSWORD } from '../config/auth.js';

const active = ref(false);

export function useParentMode() {
  function login(password) {
    if (password === PARENT_PASSWORD) {
      active.value = true;
      return true;
    }
    return false;
  }

  function logout() {
    active.value = false;
  }

  return { active, login, logout };
}
