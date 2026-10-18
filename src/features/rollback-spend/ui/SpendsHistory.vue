<template>
  <section class="ios-card">
    <DayGroupedList v-if="groups.length" :groups="groups" :key-of="keyOf">
      <template #summary="{ group }">
        <span class="text-grey-5">−{{ dayTotal(group.items) }} б.</span>
      </template>
      <template #default="{ item: spend }">
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ rewardName(spend.rewardId) }}<template v-if="spend.variantName"> → {{ spend.variantName }}</template>
            </q-item-label>
            <q-item-label caption>{{ childName(spend.childId) }} · −{{ spend.cost }} б.</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense no-caps color="primary" icon="undo" label="Вернуть" @click="rollback(spend)" />
          </q-item-section>
        </q-item>
      </template>
    </DayGroupedList>
    <div v-else class="q-pa-md text-grey-5">Списаний пока нет.</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import type { Subscription } from 'dexie';
import { dayKeyOf } from '@/shared/lib/date';
import { groupByDay } from '@/shared/lib/groupByDay';
import DayGroupedList from '@/shared/ui/DayGroupedList.vue';
import { deleteSpend, watchSpends, type Spend } from '@/entities/spend';
import { useRewardsStore } from '@/entities/reward';
import { useChildrenStore } from '@/entities/child';

const $q = useQuasar();
const rewardsStore = useRewardsStore();
const childrenStore = useChildrenStore();
const rewardName = (rewardId: string): string => rewardsStore.nameOf(rewardId);
const childName = (childId: string): string => childrenStore.nameOf(childId);
const spends = ref<Spend[]>([]);
let subscription: Subscription | null = null;

const groups = computed(() => groupByDay(spends.value, (spend) => dayKeyOf(spend.createdAt)));

const keyOf = (spend: Spend): string => spend.id;

const dayTotal = (items: readonly Spend[]): number => items.reduce((sum, spend) => sum + spend.cost, 0);

onMounted(() => {
  subscription = watchSpends((rows) => {
    spends.value = rows.filter((row) => row.source === 'purchase');
  });
});

onUnmounted(() => {
  subscription?.unsubscribe();
  subscription = null;
});

const rollback = (spend: Spend): void => {
  $q.dialog({
    title: 'Вернуть баллы',
    message: `Отменить списание «${rewardName(spend.rewardId)}» и вернуть ${spend.cost} б. ${childName(spend.childId)}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await deleteSpend(spend.id);
    $q.notify({ type: 'warning', message: 'Списание отменено, баллы возвращены' });
  });
};
</script>
