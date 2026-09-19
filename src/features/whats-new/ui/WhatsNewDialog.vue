<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Что нового</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-virtual-scroll :items="changelog" style="max-height: 60vh" v-slot="{ item }">
          <div :key="item.version" class="q-px-md q-py-sm">
            <div class="row items-center q-gutter-sm">
              <span class="text-weight-bold">v{{ item.version }}</span>
              <span class="text-caption text-grey-6">{{ item.date }}</span>
            </div>
            <ul class="q-mt-xs q-mb-none">
              <li v-for="(note, index) in item.notes" :key="index" class="text-body2">{{ note }}</li>
            </ul>
          </div>
        </q-virtual-scroll>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { CHANGELOG } from '@/entities/app-version';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const changelog = [...CHANGELOG];
</script>
