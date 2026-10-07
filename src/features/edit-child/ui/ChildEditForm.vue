<template>
  <div class="form-stack">
    <div class="form-row">
      <q-avatar size="72px" color="grey-9">
        <img v-if="photoUrl" :src="photoUrl" :alt="name" />
        <MonsterTruck v-else :color="carColor" :size="52" />
      </q-avatar>
      <div class="column items-start">
        <q-btn flat dense no-caps color="primary" icon="photo_camera" label="Загрузить фото" @click="pickPhoto" />
        <q-btn v-if="photo" flat dense no-caps color="grey-5" icon="hide_image" label="Убрать фото" @click="photo = ''" />
      </div>
    </div>

    <q-input v-model="name" label="Имя" autofocus maxlength="30" />

    <q-select
      v-model="goalRewardId"
      :options="goalOptions"
      label="Цель — на что копит"
      emit-value
      map-options
      clearable
      :hint="goalOptions.length === 0 ? 'Сначала добавьте награду в магазин' : 'Под копилкой появится полоса до цели'"
      @update:model-value="goalVariantId = null"
    />
    <q-select
      v-if="variantOptions.length > 0"
      v-model="goalVariantId"
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
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
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
import { useRewardsStore } from '@/entities/reward';
import { PHOTO_SIZE } from '../lib/constants';

const props = withDefaults(defineProps<{ child?: Child | null }>(), { child: null });
const emit = defineEmits<{ done: []; cancel: [] }>();

const $q = useQuasar();
const childrenStore = useChildrenStore();
const rewardsStore = useRewardsStore();

const name = ref('');
const carColor = ref<string>(COLOR_PALETTE[0]);
const photo = ref('');
const goalRewardId = ref<string | null>(null);
const goalVariantId = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const photoUrl = computed(() => childPhotoUrl(photo.value));
const canSave = computed(() => name.value.trim().length > 0);

const goalOptions = computed(() =>
  rewardsStore.shop.map((reward) => ({ value: reward.id, label: `${reward.name} · ${reward.points} б.` }))
);

const variantOptions = computed(() =>
  goalRewardId.value
    ? rewardsStore.variantsOf(goalRewardId.value).map((variant) => ({ value: variant.id, label: variant.name }))
    : []
);

const goal = computed(() => {
  if (!goalRewardId.value) {
    return undefined;
  }
  return goalVariantId.value
    ? { rewardId: goalRewardId.value, variantId: goalVariantId.value }
    : { rewardId: goalRewardId.value };
});

const randomOf = (colors: readonly string[]): string =>
  colors[Math.floor(Math.random() * colors.length)] ?? COLOR_PALETTE[0];

const freeColor = (): string => {
  const taken = new Set(childrenStore.active.map((row) => row.carColor));
  const free = COLOR_PALETTE.filter((color) => !taken.has(color));
  return randomOf(free.length > 0 ? free : COLOR_PALETTE);
};

const reset = (): void => {
  name.value = props.child?.name ?? '';
  carColor.value = props.child?.carColor ?? freeColor();
  photo.value = props.child?.photo ?? '';
  goalRewardId.value = props.child?.goal?.rewardId ?? null;
  goalVariantId.value = props.child?.goal?.variantId ?? null;
};

onMounted(reset);

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
    photo.value = await resizePhoto(file, PHOTO_SIZE, 'square');
  } catch {
    $q.notify({ type: 'negative', message: 'Не получилось открыть фото' });
  } finally {
    input.value = '';
  }
};

const save = async (): Promise<void> => {
  const draft = { name: name.value.trim(), carColor: carColor.value, photo: photo.value, goal: goal.value };
  if (props.child) {
    await updateChild(props.child.id, draft);
  } else {
    await createChild(draft);
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
