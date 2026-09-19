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
                {{ childName(spend.childId) }} · −{{ spend.cost }} б. · {{ formatDate(spend.createdAt) }}
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

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { deleteSpend, watchSpends } from '@/entities/spend';
import { rewardName } from '@/entities/reward';
import { childName } from '@/entities/child';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const $q = useQuasar();
const spends = ref([]);
let subscription = null;

function start() {
  if (subscription) {
    return;
  }
  subscription = watchSpends((rows) => {
    spends.value = rows;
  });
}

function stop() {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
}

watch(
  () => props.modelValue,
  (open) => (open ? start() : stop())
);

onUnmounted(stop);

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function rollback(spend) {
  $q.dialog({
    title: 'Вернуть баллы',
    message: `Отменить списание «${rewardName(spend.rewardId)}» и вернуть ${spend.cost} б. ${childName(spend.childId)}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await deleteSpend(spend.id);
    $q.notify({ type: 'warning', message: 'Списание отменено, баллы возвращены' });
  });
}
</script>
