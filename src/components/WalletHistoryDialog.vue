<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 340px; max-width: 92vw">
      <q-card-section class="row items-center">
        <div class="text-h6">Кошелёк · {{ childName }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-virtual-scroll v-if="ledger.length" :items="ledger" style="max-height: 55vh" v-slot="{ item }">
          <q-item :key="item.id">
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
              <q-item-label caption>{{ item.dayLabel }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span :class="item.amount >= 0 ? 'text-positive' : 'text-negative'">
                {{ item.amount >= 0 ? '+' : '' }}{{ item.amount }} б.
              </span>
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
        <div v-else class="q-pa-md text-grey-5">Пока пусто.</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="row items-center">
        <div class="text-weight-medium">Баланс</div>
        <q-space />
        <div class="text-weight-bold text-primary">{{ total }} б.</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getChildLedger } from '@/entities/wallet';
import { taskName } from '@/entities/task';
import { rewardName } from '@/entities/reward';
import { findChild } from '@/entities/child';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  childId: { type: String, default: null },
});
const emit = defineEmits(['update:modelValue']);

const ledger = ref([]);

const childName = computed(() => (props.childId ? (findChild(props.childId)?.name ?? '') : ''));

const total = computed(() => {
  let sum = 0;
  for (const item of ledger.value) {
    sum += item.amount;
  }
  return sum;
});

function formatDay(dateKey) {
  const [year, month, day] = dateKey.split('-');
  return `${day}.${month}.${year}`;
}

function formatTimestampDay(timestamp) {
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function load() {
  if (!props.childId) {
    ledger.value = [];
    return;
  }
  const { completions, spends } = await getChildLedger(props.childId);
  const items = [];
  for (const row of completions) {
    items.push({ id: row.id, label: taskName(row.taskId), amount: row.points, ts: row.createdAt, dayLabel: formatDay(row.date) });
  }
  for (const spend of spends) {
    items.push({ id: spend.id, label: rewardName(spend.rewardId), amount: -spend.cost, ts: spend.createdAt, dayLabel: formatTimestampDay(spend.createdAt) });
  }
  items.sort((first, second) => second.ts - first.ts);
  ledger.value = items;
}

watch(
  () => [props.modelValue, props.childId],
  ([open]) => {
    if (open) {
      load();
    }
  }
);
</script>
