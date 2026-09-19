<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card>
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
              <span v-if="item.amount === 0" class="text-orange">приз</span>
              <span v-else :class="item.amount > 0 ? 'text-positive' : 'text-negative'">
                {{ item.amount > 0 ? '+' : '' }}{{ item.amount }} б.
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { formatDayKeyNumeric, formatTimestampNumeric } from '@/shared/lib/date';
import { getChildLedger } from '@/entities/wallet';
import { useTasksStore } from '@/entities/task';
import { useRewardsStore } from '@/entities/reward';
import { useChildrenStore } from '@/entities/child';

interface LedgerItem {
  id: string;
  label: string;
  amount: number;
  ts: number;
  dayLabel: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    childId?: string | null;
  }>(),
  { modelValue: false, childId: null }
);
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const tasksStore = useTasksStore();
const rewardsStore = useRewardsStore();
const childrenStore = useChildrenStore();

const ledger = ref<LedgerItem[]>([]);

const childName = computed(() => (props.childId ? childrenStore.nameOf(props.childId) : ''));

const total = computed(() => ledger.value.reduce((sum, item) => sum + item.amount, 0));

const load = async (): Promise<void> => {
  if (!props.childId) {
    ledger.value = [];
    return;
  }
  const { completions, spends } = await getChildLedger(props.childId);
  const items: LedgerItem[] = [
    ...completions.map((row) => ({
      id: row.id,
      label: tasksStore.nameOf(row.taskId),
      amount: row.points,
      ts: row.createdAt,
      dayLabel: formatDayKeyNumeric(row.date),
    })),
    ...spends.map((spend) => ({
      id: spend.id,
      label: rewardsStore.nameOf(spend.rewardId),
      amount: -spend.cost,
      ts: spend.createdAt,
      dayLabel: formatTimestampNumeric(spend.createdAt),
    })),
  ];
  items.sort((first, second) => second.ts - first.ts);
  ledger.value = items;
};

watch(
  () => [props.modelValue, props.childId],
  ([open]) => {
    if (open) {
      void load();
    }
  }
);
</script>
