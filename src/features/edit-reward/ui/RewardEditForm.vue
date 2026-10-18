<template>
  <div class="form-stack">
    <div class="form-row">
      <div class="reward-preview" :style="{ background: previewColor }">
        <q-icon :name="icon" size="26px" color="white" />
      </div>
      <q-input v-model="name" class="col" :label="t('editReward.name')" autofocus maxlength="40" />
    </div>

    <q-input
      v-model.number="points"
      type="number"
      inputmode="numeric"
      :label="t('editReward.price')"
      :min="minPrice"
      :error="!priceValid"
      :error-message="minPrice > 0 ? t('editReward.shopMinPrice') : t('editReward.minPrice')"
      :hint="priceHint"
    />

    <div>
      <div class="text-caption text-grey-5">{{ t('editReward.where') }}</div>
      <q-option-group v-model="visibility" :options="visibilityOptions" color="primary" />
    </div>

    <div>
      <div class="text-caption text-grey-5 q-mb-sm">{{ t('editReward.icon') }}</div>
      <IconPicker v-model="icon" :color="previewColor" />
    </div>

    <VariantsEditor v-model="variants" />

    <div class="row items-center q-gutter-sm">
      <q-btn v-if="reward" flat no-caps color="negative" icon="delete" :label="t('common.delete')" @click="remove" />
      <q-space />
      <q-btn flat no-caps :label="t('common.cancel')" @click="emit('cancel')" />
      <q-btn unelevated no-caps color="primary" :label="t('common.save')" :disable="!canSave" @click="save" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();
const rewardsStore = useRewardsStore();

const name = ref('');
const points = ref(5);
const icon = ref<string>(ICON_CHOICES[0]);
const visibility = ref<RewardVisibility>('shop');
const variants = ref<EditableVariant[]>([]);

const offersGoal = computed(() => props.visibility === 'goal' || props.reward?.visibility === 'goal');

const visibilityOptions = computed(() =>
  rewardVisibilitySchema.options
    .filter((value) => value !== 'goal' || offersGoal.value)
    .map((value) => ({ value, label: t(REWARD_VISIBILITY_LABELS[value]) }))
);

const previewColor = computed(() =>
  rewardColor({ points: points.value || 0, ...(props.reward?.color ? { color: props.reward.color } : {}) })
);

const minPrice = computed(() => minRewardPrice(visibility.value));

const priceValid = computed(() => Number.isInteger(points.value) && points.value >= minPrice.value);

const priceHint = computed(() => {
  if (visibility.value === 'streak') {
    return t('editReward.streakPriceHint');
  }
  if (visibility.value === 'goal') {
    return t('editReward.goalPriceHint');
  }
  return props.reward ? t('editReward.pastPurchasesKept') : undefined;
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
    title: t('editReward.removeTitle'),
    message: t('editReward.removeMessage', { name: reward.name }),
    cancel: { flat: true, noCaps: true, label: t('common.cancel') },
    ok: { flat: true, noCaps: true, color: 'negative', label: t('common.delete') },
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
