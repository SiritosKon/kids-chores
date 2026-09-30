<template>
  <div class="row items-center no-wrap q-mb-md">
    <q-btn flat round dense icon="arrow_back" aria-label="Назад" @click="goBack(backTo)" />
    <div class="text-h6 q-ml-sm ellipsis">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
import { useGoBack } from '@/shared/lib/useGoBack';

defineProps<{ title: string; backTo: string }>();

const goBack = useGoBack();
</script>
