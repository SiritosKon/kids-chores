<template>
  <svg :width="size" :height="height" viewBox="0 0 64 44" fill="none" aria-hidden="true" role="img">
    <template v-if="kind === 'boat'">
      <g stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M32 4 V20" />
        <path d="M33 5 L46 18 H33 Z" fill="#fdd835" />
        <rect x="18" y="18" width="26" height="9" rx="2" :fill="color" />
        <rect x="22" y="20.5" width="6" height="4" rx="1" fill="#e3f2fd" />
        <rect x="31" y="20.5" width="6" height="4" rx="1" fill="#e3f2fd" />
        <path d="M4 27 H60 L52 40 H12 Z" :fill="color" />
      </g>
      <g stroke="#1b1b1b" stroke-width="1.5" fill="#e3f2fd">
        <circle cx="20" cy="33" r="2.4" />
        <circle cx="32" cy="33" r="2.4" />
        <circle cx="44" cy="33" r="2.4" />
      </g>
    </template>

    <template v-else-if="kind === 'plane'">
      <g stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M12 21 L5 9 H12 L20 18 Z" :fill="color" />
        <path d="M8 22 Q8 15 18 15 H46 Q56 15 58 22 Q56 29 46 29 H18 Q8 29 8 22 Z" :fill="color" />
        <path d="M44 16.5 H48 Q53 17 55.5 21 H44 Z" fill="#e3f2fd" />
        <path d="M24 23 L32 38 H39 L35 23 Z" :fill="color" />
        <ellipse cx="59.5" cy="22" rx="2" ry="9" fill="#fdd835" />
      </g>
      <g stroke="#1b1b1b" stroke-width="1.5" fill="#e3f2fd">
        <circle cx="22" cy="21" r="2" />
        <circle cx="29" cy="21" r="2" />
        <circle cx="36" cy="21" r="2" />
      </g>
    </template>

    <template v-else-if="kind === 'helicopter'">
      <g stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
        <rect x="10" y="4" width="44" height="3.5" rx="1.75" fill="#2b2b2b" />
        <rect x="30" y="7.5" width="4" height="6" fill="#2b2b2b" />
        <path d="M3 18 H18 V24 H3 Z" :fill="color" />
        <circle cx="5" cy="16" r="4.5" fill="#fdd835" />
        <path d="M16 25 Q16 13 30 13 H38 Q52 13 52 26 Q52 34 42 34 H26 Q16 34 16 25 Z" :fill="color" />
        <path d="M38 16 Q48 16 49.5 25 H38 Z" fill="#e3f2fd" />
        <path d="M24 34 V39 M42 34 V39 M18 39 H50" />
      </g>
    </template>

    <template v-else-if="kind === 'ball'">
      <defs>
        <clipPath :id="clipId"><circle cx="32" cy="22" r="19" /></clipPath>
      </defs>
      <circle cx="32" cy="22" r="19" fill="#ffffff" />
      <g :clip-path="`url(#${clipId})`" stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M32 15 L32 5 M38.7 19.8 L48.2 16.7 M36.1 27.7 L42 35.8 M27.9 27.7 L22 35.8 M25.3 19.8 L15.8 16.7" />
        <path d="M32 7.5 L25.8 3 L28.2 -4.3 L35.8 -4.3 L38.2 3 Z" :fill="color" />
        <path d="M45.8 17.5 L48.2 10.3 L55.8 10.3 L58.2 17.5 L52 22 Z" :fill="color" />
        <path d="M40.5 33.7 L48.2 33.7 L50.5 41 L44.3 45.5 L38.2 41 Z" :fill="color" />
        <path d="M23.5 33.7 L25.8 41 L19.7 45.5 L13.5 41 L15.8 33.7 Z" :fill="color" />
        <path d="M18.2 17.5 L12 22 L5.8 17.5 L8.2 10.3 L15.8 10.3 Z" :fill="color" />
      </g>
      <g stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round">
        <path d="M32 15 L38.7 19.8 L36.1 27.7 L27.9 27.7 L25.3 19.8 Z" :fill="color" />
        <circle cx="32" cy="22" r="19" />
      </g>
    </template>

    <template v-else>
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
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { DEFAULT_METER_FIGURE } from './constants';
import type { MeterFigureKind } from './types';

const props = withDefaults(
  defineProps<{
    kind?: MeterFigureKind;
    color?: string;
    size?: number;
  }>(),
  { kind: DEFAULT_METER_FIGURE, color: '#42a5f5', size: 46 }
);

const clipId = `meter-ball-${useId()}`;

const height = computed(() => Math.round((props.size * 44) / 64));
</script>
