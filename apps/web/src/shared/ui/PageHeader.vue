<template>
  <div class="row items-center no-wrap q-mb-md">
    <q-btn
      flat
      round
      dense
      icon="arrow_back"
      class="page-header__back"
      :aria-label="t('common.back')"
      @click="goBack(backTo)"
    />
    <div v-if="$slots.leading" class="q-ml-sm"><slot name="leading" /></div>
    <div class="text-h6 q-ml-sm ellipsis">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useGoBack } from '@/shared/lib/useGoBack';

defineProps<{ title: string; backTo: string }>();

const goBack = useGoBack();
const { t } = useI18n();
</script>

<style scoped>
.page-header__back {
  margin-left: -8px;
}
</style>
