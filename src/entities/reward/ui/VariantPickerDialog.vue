<template>
  <q-dialog :ref="dialog.dialogRef" persistent @hide="dialog.onDialogHide">
    <q-card class="dialog--picker">
      <q-card-section class="row items-center no-wrap">
        <q-btn v-if="picked" flat round dense icon="arrow_back" aria-label="Назад" @click="picked = null" />
        <div class="col q-ml-xs">
          <div class="text-h6 ellipsis">{{ picked ? 'Точно этот?' : `Выбери: ${rewardName}` }}</div>
          <div v-if="caption && !picked" class="text-caption text-grey-5">{{ caption }}</div>
        </div>
        <q-btn flat round dense icon="close" aria-label="Закрыть" @click="dialog.onDialogCancel" />
      </q-card-section>
      <q-separator />

      <q-card-section v-if="picked" class="picked">
        <button type="button" class="picked__photo" @click="zoomed = picked.id">
          <img v-if="photos.get(picked.id)" :src="photos.get(picked.id)" :alt="picked.name" />
          <q-icon v-else name="image" size="64px" color="grey-7" />
        </button>
        <div class="text-h5 text-weight-bold q-mt-md">{{ picked.name }}</div>
        <div class="row q-gutter-md q-mt-lg justify-center">
          <q-btn outline rounded no-caps color="grey-5" label="Выбрать другой" @click="picked = null" />
          <q-btn unelevated rounded no-caps color="primary" label="Да, этот!" @click="confirm" />
        </div>
      </q-card-section>

      <div v-else class="variants">
        <div v-for="variant in variants" :key="variant.id" class="variant">
          <button type="button" class="variant__photo" @click="zoomed = variant.id">
            <img v-if="photos.get(variant.id)" :src="photos.get(variant.id)" :alt="variant.name" />
            <q-icon v-else name="image" size="48px" color="grey-7" />
          </button>
          <div class="variant__name">{{ variant.name }}</div>
          <q-btn unelevated rounded no-caps color="primary" label="Хочу этот" @click="picked = variant" />
        </div>
      </div>
    </q-card>

    <q-dialog :model-value="zoomed !== null" maximized @update:model-value="zoomed = null">
      <div class="zoom" @click="zoomed = null">
        <img v-if="zoomed && photos.get(zoomed)" :src="photos.get(zoomed)" alt="" />
      </div>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { getVariantPhotos } from '../api/variantsRepo';
import type { RewardVariant } from '../model/types';

const props = withDefaults(
  defineProps<{
    rewardName: string;
    variants: RewardVariant[];
    caption?: string;
  }>(),
  { caption: '' }
);
defineEmits([...useDialogPluginComponent.emits]);

const dialog = useDialogPluginComponent();

const photos = ref(new Map<string, string>());
const picked = ref<RewardVariant | null>(null);
const zoomed = ref<string | null>(null);

onMounted(async () => {
  photos.value = await getVariantPhotos(props.variants.map((variant) => variant.id));
});

const confirm = (): void => {
  if (picked.value) {
    dialog.onDialogOK({ id: picked.value.id, name: picked.value.name });
  }
};
</script>

<style scoped>
.dialog--picker {
  width: min(900px, 96vw);
  max-width: 96vw !important;
}

.variants {
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.variant {
  flex: 0 0 min(300px, 78vw);
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #2c2c2e;
}

.variant__photo,
.picked__photo {
  border: none;
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #1c1c1e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
}

.variant__photo {
  aspect-ratio: 1;
}

.variant__photo img,
.picked__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.variant__name {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.picked {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.picked__photo {
  width: min(420px, 80vw);
  aspect-ratio: 1;
}

.zoom {
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
