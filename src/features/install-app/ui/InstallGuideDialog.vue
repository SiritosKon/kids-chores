<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @before-show="slide = 0">
    <q-card class="dialog--form">
      <q-card-section class="row items-center">
        <div class="text-h6">Как добавить на экран «Домой»</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />

      <q-carousel
        v-model="slide"
        swipeable
        animated
        height="340px"
        class="install-guide"
      >
        <q-carousel-slide
          v-for="(item, index) in INSTALL_SLIDES"
          :key="item.icon"
          :name="index"
          class="column no-wrap flex-center text-center"
        >
          <div class="install-guide__step">Шаг {{ index + 1 }} из {{ INSTALL_SLIDES.length }}</div>
          <div class="install-guide__icon" :class="{ 'install-guide__icon--warning': item.warning }">
            <q-icon :name="item.icon" size="44px" />
          </div>
          <div class="text-subtitle1 text-weight-bold q-mt-md">{{ item.title }}</div>
          <p class="install-guide__text">{{ item.text }}</p>
        </q-carousel-slide>
      </q-carousel>

      <q-separator />
      <q-card-actions>
        <q-btn v-if="slide > 0" flat no-caps icon="arrow_back" label="Назад" @click="slide -= 1" />
        <q-space />
        <q-btn
          v-if="slide < INSTALL_SLIDES.length - 1"
          unelevated
          no-caps
          color="primary"
          label="Далее"
          @click="slide += 1"
        />
        <q-btn v-else unelevated no-caps color="primary" label="Понятно" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { INSTALL_SLIDES } from '../model/constants';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const slide = ref(0);
</script>

<style scoped>
.install-guide {
  background: transparent;
}

.install-guide__step {
  font-size: 12px;
  color: #8e8e93;
  margin-bottom: 14px;
}

.install-guide__icon {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  background: rgba(10, 132, 255, 0.18);
  color: #0a84ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.install-guide__icon--warning {
  background: rgba(255, 159, 10, 0.18);
  color: #ff9f0a;
}

.install-guide__text {
  max-width: 360px;
  margin: 8px auto 0;
  color: #d1d1d6;
  font-size: 14px;
  line-height: 1.45;
}
</style>
