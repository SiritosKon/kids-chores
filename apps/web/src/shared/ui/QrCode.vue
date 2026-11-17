<template>
  <svg
    class="qr-code"
    :viewBox="`0 0 ${qr.size} ${qr.size}`"
    shape-rendering="crispEdges"
    role="img"
    :aria-label="label"
  >
    <rect :width="qr.size" :height="qr.size" fill="#fff" />
    <path :d="path" fill="#000" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { encode } from 'uqr';
import { QR_BORDER, QR_ERROR_CORRECTION } from './constants';

const props = defineProps<{ value: string; label: string }>();

const qr = computed(() => encode(props.value, { ecc: QR_ERROR_CORRECTION, border: QR_BORDER }));

const path = computed(() =>
  qr.value.data
    .flatMap((row, y) => row.flatMap((dark, x) => (dark ? [`M${x} ${y}h1v1h-1z`] : [])))
    .join('')
);
</script>

<style scoped>
.qr-code {
  display: block;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
  border-radius: 12px;
}
</style>
