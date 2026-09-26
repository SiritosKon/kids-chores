<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @before-show="reset">
    <q-card class="dialog--form">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ reward ? 'Награда' : 'Новая награда' }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />

      <q-card-section class="form-stack">
        <div class="form-row">
          <div class="reward-preview" :style="{ background: previewColor }">
            <q-icon :name="icon" size="26px" color="white" />
          </div>
          <q-input v-model="name" class="col" label="Название" autofocus maxlength="40" />
        </div>

        <q-input
          v-model.number="points"
          type="number"
          inputmode="numeric"
          label="Цена в баллах"
          :min="1"
          :hint="reward ? 'Прошлые покупки не изменятся' : undefined"
        />

        <div>
          <div class="text-caption text-grey-5">Где награда</div>
          <q-option-group v-model="visibility" :options="visibilityOptions" color="primary" />
        </div>

        <div>
          <div class="text-caption text-grey-5 q-mb-sm">Иконка</div>
          <IconPicker v-model="icon" :color="previewColor" />
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions>
        <q-btn v-if="reward" flat no-caps color="negative" icon="delete" label="Удалить" @click="remove" />
        <q-space />
        <q-btn v-if="returnable" flat no-caps icon="arrow_back" label="Назад" @click="goBack" />
        <q-btn v-else flat no-caps label="Отмена" v-close-popup />
        <q-btn unelevated no-caps color="primary" label="Сохранить" :disable="!canSave" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import IconPicker from '@/shared/ui/IconPicker.vue';
import { ICON_CHOICES } from '@/shared/ui/constants';
import {
  createReward,
  updateReward,
  archiveReward,
  rewardColor,
  rewardVisibilitySchema,
  REWARD_VISIBILITY_LABELS,
  type Reward,
  type RewardVisibility,
} from '@/entities/reward';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    reward?: Reward | null;
    visibility?: RewardVisibility;
    returnable?: boolean;
  }>(),
  { modelValue: false, reward: null, visibility: 'shop', returnable: false }
);
const emit = defineEmits<{
  'update:modelValue': [open: boolean];
  created: [reward: Reward];
  back: [];
}>();

const $q = useQuasar();

const name = ref('');
const points = ref(5);
const icon = ref<string>(ICON_CHOICES[0]);
const visibility = ref<RewardVisibility>('shop');

const visibilityOptions = rewardVisibilitySchema.options.map((value) => ({
  value,
  label: REWARD_VISIBILITY_LABELS[value],
}));

const previewColor = computed(() =>
  rewardColor({ points: points.value || 0, ...(props.reward?.color ? { color: props.reward.color } : {}) })
);

const canSave = computed(
  () => name.value.trim().length > 0 && Number.isInteger(points.value) && points.value > 0
);

const reset = (): void => {
  name.value = props.reward?.name ?? '';
  points.value = props.reward?.points ?? 5;
  icon.value = props.reward?.icon ?? 'card_giftcard';
  visibility.value = props.reward?.visibility ?? props.visibility;
};

const close = (): void => {
  emit('update:modelValue', false);
};

const goBack = (): void => {
  close();
  emit('back');
};

const save = async (): Promise<void> => {
  const draft = {
    name: name.value.trim(),
    points: points.value,
    icon: icon.value,
    visibility: visibility.value,
  };
  if (props.reward) {
    await updateReward(props.reward.id, draft);
  } else {
    emit('created', await createReward(draft));
  }
  close();
};

const remove = (): void => {
  const reward = props.reward;
  if (!reward) {
    return;
  }
  $q.dialog({
    title: 'Удалить награду',
    message: `«${reward.name}» пропадёт из списка. Прошлые покупки останутся в истории.`,
    cancel: { flat: true, noCaps: true, label: 'Отмена' },
    ok: { flat: true, noCaps: true, color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(async () => {
    await archiveReward(reward.id);
    close();
  });
};
</script>

<style scoped>
.reward-preview {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
