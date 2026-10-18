<template>
  <section class="ios-card">
    <div v-for="item in CHANGELOG" :key="item.version" class="q-px-md q-py-sm whats-new__entry">
      <div class="row items-center q-gutter-sm">
        <span class="text-weight-bold">v{{ item.version }}</span>
        <span class="text-caption text-grey-6">{{ item.date }}</span>
      </div>
      <ul class="q-mt-xs q-mb-none">
        <li v-for="(note, index) in item.notes" :key="index" class="text-body2">{{ note }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CHANGELOG } from '@/entities/app-version';
</script>

<style scoped>
.whats-new__entry:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
