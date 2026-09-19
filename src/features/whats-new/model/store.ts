import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useWhatsNewStore = defineStore('whats-new', () => {
  const isOpen = ref(false);

  function open(): void {
    isOpen.value = true;
  }

  return { isOpen, open };
});
