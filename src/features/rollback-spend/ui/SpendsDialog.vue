<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 340px; max-width: 92vw; border-radius: 18px">
      <q-card-section class="row items-center">
        <div class="text-h6">История списаний</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-list v-if="spends.length" separator>
          <q-item v-for="spend in spends" :key="spend.id">
            <q-item-section>
              <q-item-label>{{ rewardName(spend.rewardId) }}</q-item-label>
              <q-item-label caption>
                {{ childName(spend.childId) }} · −{{ spend.cost }} б. · {{ formatTimestampShort(spend.createdAt) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense no-caps color="primary" icon="undo" label="Вернуть" @click="rollback(spend)" />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="q-pa-md text-grey-5">Списаний пока нет.</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import type { Subscription } from 'dexie';
import { formatTimestampShort } from '@/shared/lib/date';
import { deleteSpend, watchSpends, type Spend } from '@/entities/spend';
import { rewardName } from '@/entities/reward';
import { childName } from '@/entities/child';

const props = withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const $q = useQuasar();
const spends = ref<Spend[]>([]);
let subscription: Subscription | null = null;

const start = (): void => {
  subscription ??= watchSpends((rows) => {
    spends.value = rows;
  });
};

const stop = (): void => {
  subscription?.unsubscribe();
  subscription = null;
};

watch(
  () => props.modelValue,
  (open) => (open ? start() : stop())
);

onUnmounted(stop);

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
