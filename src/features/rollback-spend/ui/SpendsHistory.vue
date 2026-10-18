<template>
  <section class="ios-card">
    <DayGroupedList v-if="groups.length" :groups="groups" :key-of="keyOf">
      <template #summary="{ group }">
        <span class="text-grey-5">−{{ t('common.pointsShort', dayTotal(group.items)) }}</span>
      </template>
      <template #default="{ item: spend }">
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ rewardName(spend.rewardId) }}<template v-if="spend.variantName"> → {{ spend.variantName }}</template>
            </q-item-label>
            <q-item-label caption>
              {{ childName(spend.childId) }} · −{{ t('common.pointsShort', spend.cost) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="undo"
              :label="t('rollbackSpend.undo')"
              @click="rollback(spend)"
            />
          </q-item-section>
        </q-item>
      </template>
    </DayGroupedList>
    <div v-else class="q-pa-md text-grey-5">{{ t('rollbackSpend.empty') }}</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { Subscription } from 'dexie';
import { dayKeyOf } from '@/shared/lib/date';
import { groupByDay } from '@/shared/lib/groupByDay';
import DayGroupedList from '@/shared/ui/DayGroupedList.vue';
import { deleteSpend, watchSpends, type Spend } from '@/entities/spend';
import { useRewardsStore } from '@/entities/reward';
import { useChildrenStore } from '@/entities/child';

const $q = useQuasar();
const { t } = useI18n();
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
    title: t('rollbackSpend.confirmTitle'),
    message: t('rollbackSpend.confirmMessage', {
      reward: rewardName(spend.rewardId),
      points: t('common.pointsShort', spend.cost),
      child: childName(spend.childId),
    }),
    cancel: { flat: true, noCaps: true, label: t('common.cancel') },
    ok: { flat: true, noCaps: true, label: t('rollbackSpend.undo') },
    persistent: true,
  }).onOk(async () => {
    await deleteSpend(spend.id);
    $q.notify({ type: 'warning', message: t('rollbackSpend.undone') });
  });
};
</script>
