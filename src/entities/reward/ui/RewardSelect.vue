<template>
  <q-select
    ref="field"
    :model-value="modelValue"
    :options="options"
    :label="label"
    :hint="hint"
    emit-value
    map-options
    clearable
    @update:model-value="pick"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <div class="reward-select__tile" :style="{ background: scope.opt.color }">
            <q-icon :name="scope.opt.icon" size="18px" color="white" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label v-if="scope.opt.caption" caption>{{ scope.opt.caption }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { QSelect } from 'quasar';
import { useRewardsStore } from '../model/store';
import { rewardColor } from '../lib/tier';
import { rewardPriceLabel } from '../lib/visibility';
import { REWARD_VISIBILITY_LABELS } from '../lib/constants';
import type { RewardVisibility } from '../model/types';
import { NEW_REWARD_COLOR, NEW_REWARD_OPTION } from './constants';
import type { RewardOption } from './types';

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    label: string;
    hint?: string;
    visibilities?: readonly RewardVisibility[];
  }>(),
  { hint: undefined, visibilities: undefined }
);
const emit = defineEmits<{ 'update:modelValue': [rewardId: string | null]; create: [] }>();

const rewardsStore = useRewardsStore();
const field = ref<QSelect | null>(null);

const options = computed<RewardOption[]>(() => [
  ...rewardsStore.active
    .filter((reward) => props.visibilities === undefined || props.visibilities.includes(reward.visibility))
    .map((reward) => ({
      value: reward.id,
      label: `${reward.name} · ${rewardPriceLabel(reward.points)}`,
      ...(reward.visibility === 'shop' ? {} : { caption: REWARD_VISIBILITY_LABELS[reward.visibility] }),
      icon: reward.icon,
      color: rewardColor(reward),
    })),
  { value: NEW_REWARD_OPTION, label: 'Новая награда', icon: 'add', color: NEW_REWARD_COLOR },
]);

const pick = (value: string | null): void => {
  if (value === NEW_REWARD_OPTION) {
    emit('create');
    return;
  }
  emit('update:modelValue', value);
};

const open = (): void => {
  field.value?.showPopup();
};

defineExpose({ open });
</script>

<style scoped>
.reward-select__tile {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
