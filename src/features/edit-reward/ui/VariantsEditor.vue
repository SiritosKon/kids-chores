<template>
  <div>
    <div class="text-caption text-grey-5">Варианты</div>
    <div class="text-caption text-grey-6 q-mb-sm">
      Ребёнок выберет один при получении. Цена у всех вариантов одна — цена награды. Порядок меняется перетаскиванием за ⋮⋮.
    </div>
    <VueDraggable
      v-if="modelValue.length > 0"
      v-model="ordered"
      :animation="150"
      handle=".variant-handle"
      ghost-class="variant--ghost"
      class="variants q-list q-list--separator"
    >
      <q-item v-for="(variant, index) in modelValue" :key="variant.key">
        <q-item-section side class="variant-handle" aria-label="Перетащить">
          <q-icon name="drag_indicator" size="24px" color="grey-5" />
        </q-item-section>
        <q-item-section avatar>
          <button type="button" class="variant-photo" :aria-label="`Фото: ${variant.name}`" @click="pickPhoto(index)">
            <img v-if="variant.photo" :src="variant.photo" alt="" />
            <q-icon v-else name="add_a_photo" size="22px" color="grey-5" />
          </button>
        </q-item-section>
        <q-item-section>
          <q-input
            :model-value="variant.name"
            dense
            label="Название"
            maxlength="40"
            @update:model-value="rename(index, String($event ?? ''))"
          />
        </q-item-section>
        <q-item-section side>
          <q-btn flat round dense icon="delete" color="negative" aria-label="Удалить вариант" @click="remove(index)" />
        </q-item-section>
      </q-item>
    </VueDraggable>
    <q-btn flat no-caps color="primary" icon="add" label="Добавить вариант" class="q-mt-xs" @click="add" />
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onPhoto" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { VueDraggable } from 'vue-draggable-plus';
import { resizePhoto } from '@/shared/lib/resizePhoto';
import { VARIANT_PHOTO_SIZE } from '../lib/constants';
import type { EditableVariant } from './types';

const props = defineProps<{ modelValue: EditableVariant[] }>();
const emit = defineEmits<{ 'update:modelValue': [variants: EditableVariant[]] }>();

const $q = useQuasar();
const fileInput = ref<HTMLInputElement | null>(null);
const photoTarget = ref<number | null>(null);

const ordered = computed({
  get: () => props.modelValue,
  set: (variants: EditableVariant[]) => emit('update:modelValue', variants),
});

const replace = (index: number, patch: Partial<EditableVariant>): void => {
  emit(
    'update:modelValue',
    props.modelValue.map((variant, position) => (position === index ? { ...variant, ...patch } : variant))
  );
};

const rename = (index: number, name: string): void => {
  replace(index, { name });
};

const add = (): void => {
  emit('update:modelValue', [...props.modelValue, { key: crypto.randomUUID(), id: null, name: '', photo: '' }]);
  pickPhoto(props.modelValue.length);
};

const remove = (index: number): void => {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, position) => position !== index)
  );
};

const pickPhoto = (index: number): void => {
  photoTarget.value = index;
  fileInput.value?.click();
};

const onPhoto = async (): Promise<void> => {
  const input = fileInput.value;
  const file = input?.files?.[0];
  const index = photoTarget.value;
  if (!input || !file || index === null) {
    return;
  }
  try {
    replace(index, { photo: await resizePhoto(file, VARIANT_PHOTO_SIZE, 'fit') });
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось открыть фото' });
  } finally {
    input.value = '';
  }
};
</script>

<style scoped>
.variants {
  border-radius: 12px;
  background: #2c2c2e;
}

.variant-photo {
  width: 56px;
  height: 56px;
  border: none;
  padding: 0;
  border-radius: 10px;
  overflow: hidden;
  background: #1c1c1e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.variant-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.variant-handle {
  cursor: grab;
  touch-action: none;
  padding-right: 8px;
}

.variant--ghost {
  opacity: 0.4;
}
</style>
