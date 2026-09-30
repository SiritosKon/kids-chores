<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @before-show="reset">
    <q-card class="dialog--form">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ child ? 'Ребёнок' : 'Новый ребёнок' }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />

      <q-card-section class="form-stack">
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
      </q-card-section>

      <q-separator />
      <q-card-actions>
        <q-btn v-if="child" flat no-caps color="negative" icon="delete" label="Удалить" @click="remove" />
        <q-space />
        <q-btn flat no-caps label="Отмена" v-close-popup />
        <q-btn unelevated no-caps color="primary" label="Сохранить" :disable="!canSave" @click="save" />
      </q-card-actions>
      <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onPhoto" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
import { PHOTO_SIZE } from '../lib/constants';

const props = withDefaults(defineProps<{ modelValue?: boolean; child?: Child | null }>(), {
  modelValue: false,
  child: null,
});
const emit = defineEmits<{ 'update:modelValue': [open: boolean]; saved: [child: Child] }>();

const $q = useQuasar();
const childrenStore = useChildrenStore();

const name = ref('');
const carColor = ref<string>(COLOR_PALETTE[0]);
const photo = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const photoUrl = computed(() => childPhotoUrl(photo.value));
const canSave = computed(() => name.value.trim().length > 0);

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
};

const close = (): void => {
  emit('update:modelValue', false);
};

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
  const draft = { name: name.value.trim(), carColor: carColor.value, photo: photo.value };
  if (props.child) {
    await updateChild(props.child.id, draft);
    emit('saved', { ...props.child, ...draft });
  } else {
    emit('saved', await createChild(draft));
  }
  close();
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
    close();
  });
};
</script>
