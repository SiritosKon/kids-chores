<template>
  <svg
    :width="size"
    :height="height"
    viewBox="0 0 64 44"
    fill="none"
    aria-hidden="true"
    role="img"
  >
    <g stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round">
      <rect x="6" y="18" width="52" height="12" rx="4" :fill="color" />
      <path d="M22 10 h17 a3 3 0 0 1 3 3 v5 h-23 v-5 a3 3 0 0 1 3 -3 z" :fill="color" />
      <rect x="26" y="12" width="12" height="5" rx="1.5" fill="#e3f2fd" />
      <circle cx="16" cy="33" r="10" fill="#2b2b2b" />
      <circle cx="48" cy="33" r="10" fill="#2b2b2b" />
    </g>
    <circle cx="16" cy="33" r="4" fill="#fdd835" />
    <circle cx="48" cy="33" r="4" fill="#fdd835" />
    <circle cx="56" cy="22" r="1.6" fill="#fff59d" />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  color: { type: String, default: '#42a5f5' },
  size: { type: Number, default: 46 },
});

const height = computed(() => Math.round((props.size * 44) / 64));
</script>
