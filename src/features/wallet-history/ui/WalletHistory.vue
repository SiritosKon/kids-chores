<template>
  <section class="ios-card">
    <div class="row items-center q-px-md q-py-sm">
      <div class="text-weight-medium">Кошелёк</div>
      <q-space />
      <div class="text-weight-bold text-primary">
        <q-icon name="savings" size="18px" class="q-mr-xs" />{{ total }} б.
      </div>
    </div>
    <q-separator />
    <DayGroupedList v-if="groups.length" :groups="groups" :key-of="keyOf">
      <template #summary="{ group }">
        <span class="text-grey-5">{{ daySummary(group.items) }}</span>
      </template>
      <template #default="{ item }">
        <q-item>
          <q-item-section v-if="item.variantId && photos.get(item.variantId)" avatar>
            <q-avatar rounded size="40px">
              <img :src="photos.get(item.variantId)" alt="" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <span v-if="item.amount === 0" class="text-orange">приз</span>
            <span v-else :class="item.amount > 0 ? 'text-positive' : 'text-negative'">
              {{ signed(item.amount) }} б.
            </span>
          </q-item-section>
        </q-item>
      </template>
    </DayGroupedList>
    <div v-else class="q-pa-md text-grey-5">Пока пусто.</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { dayKeyOf } from '@/shared/lib/date';
import { groupByDay } from '@/shared/lib/groupByDay';
import DayGroupedList from '@/shared/ui/DayGroupedList.vue';
import { getChildLedger } from '@/entities/wallet';
import { useTasksStore } from '@/entities/task';
import { useRewardsStore, getVariantPhotos } from '@/entities/reward';
import type { LedgerItem } from './types';

const props = defineProps<{ childId: string }>();

const tasksStore = useTasksStore();
const rewardsStore = useRewardsStore();

const ledger = ref<LedgerItem[]>([]);
const photos = ref(new Map<string, string>());

const total = computed(() => ledger.value.reduce((sum, item) => sum + item.amount, 0));

const groups = computed(() => groupByDay(ledger.value, (item) => item.day));

const keyOf = (item: LedgerItem): string => item.id;

const signed = (amount: number): string => (amount > 0 ? `+${amount}` : String(amount));

const daySummary = (items: readonly LedgerItem[]): string => {
  const earned = items.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
  const spent = items.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0);
  return [earned > 0 ? signed(earned) : '', spent < 0 ? signed(spent) : ''].filter(Boolean).join(' / ');
};

const load = async (childId: string): Promise<void> => {
  const { completions, spends } = await getChildLedger(childId);
  const items: LedgerItem[] = [
    ...completions.map((row) => ({
      id: row.id,
      label: tasksStore.nameOf(row.taskId),
      amount: row.points,
      ts: row.createdAt,
      day: row.date,
    })),
    ...spends.map((spend) => ({
      id: spend.id,
      label: spend.variantName
        ? `${rewardsStore.nameOf(spend.rewardId)} → ${spend.variantName}`
        : rewardsStore.nameOf(spend.rewardId),
      amount: -spend.cost,
      ts: spend.createdAt,
      day: dayKeyOf(spend.createdAt),
      ...(spend.variantId ? { variantId: spend.variantId } : {}),
    })),
  ];
  items.sort((first, second) => second.ts - first.ts);
  ledger.value = items;
  photos.value = await getVariantPhotos(items.flatMap((item) => (item.variantId ? [item.variantId] : [])));
};

watch(
  () => props.childId,
  (childId) => {
    void load(childId);
  },
  { immediate: true }
);
</script>
