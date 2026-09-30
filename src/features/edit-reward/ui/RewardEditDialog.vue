<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="dialog--form">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ reward ? 'Награда' : 'Новая награда' }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />

      <q-card-section>
        <RewardEditForm
          :reward="reward"
          :visibility="visibility"
          @created="emit('created', $event)"
          @done="close"
          @cancel="close"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { Reward, RewardVisibility } from '@/entities/reward';
import RewardEditForm from './RewardEditForm.vue';

withDefaults(
  defineProps<{
    modelValue?: boolean;
    reward?: Reward | null;
    visibility?: RewardVisibility;
  }>(),
  { modelValue: false, reward: null, visibility: 'shop' }
);
const emit = defineEmits<{
  'update:modelValue': [open: boolean];
  created: [reward: Reward];
}>();

const close = (): void => {
  emit('update:modelValue', false);
};
</script>
