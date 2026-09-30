<template>
  <div>
    <div class="text-caption text-grey-5">Варианты</div>
    <div class="text-caption text-grey-6 q-mb-sm">
      Ребёнок выберет один при получении. Цена у всех вариантов одна — цена награды.
    </div>
    <q-list v-if="modelValue.length > 0" separator class="variants">
      <q-item v-for="(variant, index) in modelValue" :key="variant.key">
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
        <q-item-section side class="variant-actions">
          <q-btn flat round dense icon="arrow_upward" :disable="index === 0" aria-label="Выше" @click="move(index, -1)" />
          <q-btn
            flat
            round
            dense
            icon="arrow_downward"
            :disable="index === modelValue.length - 1"
            aria-label="Ниже"
            @click="move(index, 1)"
          />
          <q-btn flat round dense icon="delete" color="negative" aria-label="Удалить вариант" @click="remove(index)" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-btn flat no-caps color="primary" icon="add" label="Добавить вариант" class="q-mt-xs" @click="add" />
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onPhoto" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { resizePhoto } from '@/shared/lib/resizePhoto';
import { VARIANT_PHOTO_SIZE } from '../lib/constants';
import type { EditableVariant } from './types';

const props = defineProps<{ modelValue: EditableVariant[] }>();
const emit = defineEmits<{ 'update:modelValue': [variants: EditableVariant[]] }>();

const $q = useQuasar();
const fileInput = ref<HTMLInputElement | null>(null);
const photoTarget = ref<number | null>(null);

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

const move = (index: number, shift: number): void => {
  const next = [...props.modelValue];
  const [variant] = next.splice(index, 1);
  if (variant) {
    next.splice(index + shift, 0, variant);
    emit('update:modelValue', next);
  }
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

.variant-actions {
  flex-direction: row;
  align-items: center;
}
</style>
