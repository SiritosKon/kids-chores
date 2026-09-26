<template>
  <q-virtual-scroll :items="groups" :style="{ maxHeight }" v-slot="{ item: group }">
    <div :key="group.day" class="day-group">
      <div class="day-group__header">
        <span class="day-group__date">{{ formatDayHeader(group.day, today) }}</span>
        <span v-if="group.day === today" class="day-group__today">сегодня</span>
        <q-space />
        <slot name="summary" :group="group" />
      </div>
      <template v-for="entry in group.items" :key="keyOf(entry)">
        <slot :item="entry" />
      </template>
    </div>
  </q-virtual-scroll>
</template>

<script setup lang="ts" generic="Item">
import { formatDayHeader, todayKey } from '@/shared/lib/date';
import type { DayGroup } from '@/shared/lib/groupByDay';

withDefaults(
  defineProps<{
    groups: DayGroup<Item>[];
    keyOf: (item: Item) => string;
    maxHeight?: string;
  }>(),
  { maxHeight: '55vh' }
);

defineSlots<{
  default: (props: { item: Item }) => unknown;
  summary: (props: { group: DayGroup<Item> }) => unknown;
}>();

const today = todayKey();
</script>

<style scoped>
.day-group__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1c1c1e;
  font-size: 13px;
  font-weight: 600;
}

.day-group__date {
  display: inline-block;
}

.day-group__date::first-letter {
  text-transform: uppercase;
}

.day-group__today {
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(255, 159, 10, 0.16);
  color: #ffb340;
  font-size: 11px;
  font-weight: 600;
}
</style>
