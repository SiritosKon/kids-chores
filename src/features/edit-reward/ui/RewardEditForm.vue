<template>
  <div class="form-stack">
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
      :min="minPrice"
      :error="!priceValid"
      :error-message="minPrice > 0 ? 'В магазине награда стоит хотя бы 1 балл' : 'Цена не может быть меньше 0'"
      :hint="priceHint"
    />

    <div>
      <div class="text-caption text-grey-5">Где награда</div>
      <q-option-group v-model="visibility" :options="visibilityOptions" color="primary" />
    </div>

    <div>
      <div class="text-caption text-grey-5 q-mb-sm">Иконка</div>
      <IconPicker v-model="icon" :color="previewColor" />
    </div>

    <VariantsEditor v-model="variants" />

    <div class="row items-center q-gutter-sm">
      <q-btn v-if="reward" flat no-caps color="negative" icon="delete" label="Удалить" @click="remove" />
      <q-space />
      <q-btn flat no-caps label="Отмена" @click="emit('cancel')" />
      <q-btn unelevated no-caps color="primary" label="Сохранить" :disable="!canSave" @click="save" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import IconPicker from '@/shared/ui/IconPicker.vue';
import { ICON_CHOICES } from '@/shared/ui/constants';
import {
  useRewardsStore,
  createReward,
  updateReward,
  archiveReward,
  saveVariants,
  getVariantPhotos,
  rewardColor,
  minRewardPrice,
  rewardVisibilitySchema,
  REWARD_VISIBILITY_LABELS,
  type Reward,
  type RewardVisibility,
} from '@/entities/reward';
import VariantsEditor from './VariantsEditor.vue';
import type { EditableVariant } from './types';

const props = withDefaults(
  defineProps<{
    reward?: Reward | null;
    visibility?: RewardVisibility;
  }>(),
  { reward: null, visibility: 'shop' }
);
const emit = defineEmits<{ created: [reward: Reward]; done: []; cancel: [] }>();

const $q = useQuasar();
const rewardsStore = useRewardsStore();

const name = ref('');
const points = ref(5);
const icon = ref<string>(ICON_CHOICES[0]);
const visibility = ref<RewardVisibility>('shop');
const variants = ref<EditableVariant[]>([]);

const visibilityOptions = rewardVisibilitySchema.options.map((value) => ({
  value,
  label: REWARD_VISIBILITY_LABELS[value],
}));

const previewColor = computed(() =>
  rewardColor({ points: points.value || 0, ...(props.reward?.color ? { color: props.reward.color } : {}) })
);

const minPrice = computed(() => minRewardPrice(visibility.value));

const priceValid = computed(() => Number.isInteger(points.value) && points.value >= minPrice.value);

const priceHint = computed(() => {
  if (visibility.value === 'streak') {
    return 'Приз за серию можно оставить без цены — 0 баллов';
  }
  return props.reward ? 'Прошлые покупки не изменятся' : undefined;
});

const canSave = computed(
  () =>
    name.value.trim().length > 0 &&
    priceValid.value &&
    variants.value.every((variant) => variant.name.trim().length > 0)
);

const reset = (): void => {
  name.value = props.reward?.name ?? '';
  points.value = props.reward?.points ?? (props.visibility === 'streak' ? 0 : 5);
  icon.value = props.reward?.icon ?? 'card_giftcard';
  visibility.value = props.reward?.visibility ?? props.visibility;
  variants.value = [];
  void loadVariants();
};

onMounted(reset);

const loadVariants = async (): Promise<void> => {
  const existing = props.reward ? rewardsStore.variantsOf(props.reward.id) : [];
  const photos = await getVariantPhotos(existing.map((variant) => variant.id));
  variants.value = existing.map((variant) => ({
    key: variant.id,
    id: variant.id,
    name: variant.name,
    photo: photos.get(variant.id) ?? '',
  }));
};

const save = async (): Promise<void> => {
  const draft = {
    name: name.value.trim(),
    points: points.value,
    icon: icon.value,
    visibility: visibility.value,
  };
  const drafts = variants.value.map(({ id, name: variantName, photo }) => ({ id, name: variantName, photo }));
  if (props.reward) {
    await updateReward(props.reward.id, draft);
    await saveVariants(props.reward.id, drafts, rewardsStore.variantsOf(props.reward.id));
  } else {
    const created = await createReward(draft);
    await saveVariants(created.id, drafts, []);
    emit('created', created);
  }
  emit('done');
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
    emit('done');
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
