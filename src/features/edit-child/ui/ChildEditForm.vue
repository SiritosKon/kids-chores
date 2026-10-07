<template>
  <div class="form-stack">
    <div class="form-row">
      <q-avatar size="72px" color="grey-9">
        <img v-if="photoUrl" :src="photoUrl" :alt="draft.name" />
        <MonsterTruck v-else :color="draft.carColor" :size="52" />
      </q-avatar>
      <div class="column items-start">
        <q-btn flat dense no-caps color="primary" icon="photo_camera" label="Загрузить фото" @click="pickPhoto" />
        <q-btn
          v-if="draft.photo"
          flat
          dense
          no-caps
          color="grey-5"
          icon="hide_image"
          label="Убрать фото"
          @click="draft.photo = ''"
        />
      </div>
    </div>

    <q-input v-model="draft.name" label="Имя" :autofocus="!openGoal" maxlength="30" />

    <q-select
      ref="goalSelect"
      :model-value="draft.goalRewardId"
      :options="goalOptions"
      label="Цель — на что копит"
      emit-value
      map-options
      clearable
      hint="Под копилкой появится полоса до цели"
      @update:model-value="pickGoal"
    />
    <q-select
      v-if="variantOptions.length > 0"
      v-model="draft.goalVariantId"
      :options="variantOptions"
      label="Какой вариант"
      emit-value
      map-options
      clearable
      hint="Не выбран — ребёнок выберет при получении"
    />

    <div class="row items-center q-gutter-sm">
      <q-btn v-if="child" flat no-caps color="negative" icon="delete" label="Удалить" @click="remove" />
      <q-space />
      <q-btn flat no-caps label="Отмена" @click="emit('cancel')" />
      <q-btn unelevated no-caps color="primary" label="Сохранить" :disable="!canSave" @click="save" />
    </div>
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onPhoto" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useQuasar, type QSelect } from 'quasar';
import { storeToRefs } from 'pinia';
import { NEW_CHILD_ID } from '@/shared/config/constants';
import MonsterTruck from '@/shared/ui/MonsterTruck.vue';
import { COLOR_PALETTE } from '@/shared/ui/constants';
import { resizePhoto } from '@/shared/lib/resizePhoto';
import {
  useChildrenStore,
  createChild,
  updateChild,
  archiveChild,
  childPhotoUrl,
  type Child,
} from '@/entities/child';
import { useRewardsStore, canBeGoal, REWARD_VISIBILITY_LABELS } from '@/entities/reward';
import { PHOTO_SIZE } from '../lib/constants';
import { NEW_GOAL_REWARD_OPTION } from '../model/constants';
import { useChildFormStore } from '../model/store';

const props = withDefaults(defineProps<{ child?: Child | null; openGoal?: boolean }>(), {
  child: null,
  openGoal: false,
});
const emit = defineEmits<{ done: []; cancel: []; 'create-reward': [] }>();

const $q = useQuasar();
const childrenStore = useChildrenStore();
const rewardsStore = useRewardsStore();
const formStore = useChildFormStore();
const { draft } = storeToRefs(formStore);

const fileInput = ref<HTMLInputElement | null>(null);
const goalSelect = ref<QSelect | null>(null);

const photoUrl = computed(() => childPhotoUrl(draft.value.photo));
const canSave = computed(() => draft.value.name.trim().length > 0);

const goalOptions = computed(() => [
  ...rewardsStore.active
    .filter((reward) => canBeGoal(reward.visibility))
    .map((reward) => ({
      value: reward.id,
      label:
        reward.visibility === 'goal'
          ? `${reward.name} · ${reward.points} б. · ${REWARD_VISIBILITY_LABELS.goal.toLowerCase()}`
          : `${reward.name} · ${reward.points} б.`,
    })),
  { value: NEW_GOAL_REWARD_OPTION, label: '＋ Новая награда' },
]);

const variantOptions = computed(() =>
  draft.value.goalRewardId
    ? rewardsStore.variantsOf(draft.value.goalRewardId).map((variant) => ({ value: variant.id, label: variant.name }))
    : []
);

const goal = computed(() => {
  const { goalRewardId, goalVariantId } = draft.value;
  if (!goalRewardId) {
    return undefined;
  }
  return goalVariantId ? { rewardId: goalRewardId, variantId: goalVariantId } : { rewardId: goalRewardId };
});

const pickGoal = (value: string | null): void => {
  if (value === NEW_GOAL_REWARD_OPTION) {
    emit('create-reward');
    return;
  }
  draft.value.goalRewardId = value;
  draft.value.goalVariantId = null;
};

const randomOf = (colors: readonly string[]): string =>
  colors[Math.floor(Math.random() * colors.length)] ?? COLOR_PALETTE[0];

const freeColor = (): string => {
  const taken = new Set(childrenStore.active.map((row) => row.carColor));
  const free = COLOR_PALETTE.filter((color) => !taken.has(color));
  return randomOf(free.length > 0 ? free : COLOR_PALETTE);
};

onMounted(async () => {
  const resumed = formStore.begin(props.child?.id ?? NEW_CHILD_ID, props.child, freeColor());
  if (props.openGoal && !resumed) {
    await nextTick();
    goalSelect.value?.showPopup();
  }
});

const pickPhoto = (): void => {
  fileInput.value?.click();
};

const onPhoto = async (): Promise<void> => {
  const input = fileInput.value;
  const file = input?.files?.[0];
  if (!input || !file) {
    return;
  }
  try {
    draft.value.photo = await resizePhoto(file, PHOTO_SIZE, 'square');
  } catch {
    $q.notify({ type: 'negative', message: 'Не получилось открыть фото' });
  } finally {
    input.value = '';
  }
};

const save = async (): Promise<void> => {
  const row = {
    name: draft.value.name.trim(),
    carColor: draft.value.carColor,
    photo: draft.value.photo,
    goal: goal.value,
  };
  if (props.child) {
    await updateChild(props.child.id, row);
  } else {
    await createChild(row);
  }
  emit('done');
};

const remove = (): void => {
  const child = props.child;
  if (!child) {
    return;
  }
  $q.dialog({
    title: 'Удалить ребёнка',
    message: `${child.name} пропадёт с экрана. Отметки и покупки останутся в истории и в экспорте.`,
    cancel: { flat: true, noCaps: true, label: 'Отмена' },
    ok: { flat: true, noCaps: true, color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(async () => {
    await archiveChild(child.id);
    emit('done');
  });
};
</script>
