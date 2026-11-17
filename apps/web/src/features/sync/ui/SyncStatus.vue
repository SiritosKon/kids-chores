<template>
  <div v-if="look" class="row items-center no-wrap q-gutter-x-sm text-caption text-grey-5">
    <q-icon :name="look.icon" color="warning" :size="compact ? '14px' : '18px'" />
    <div class="col">
      <div :class="{ ellipsis: compact }">{{ look.message }}</div>
      <div v-if="!compact && failure && sync.pending > 0">{{ t('sync.pending', { count: sync.pending }) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSyncStore } from '../model/store';
import { SYNC_FAILURES, TROUBLE_LOOKS } from './constants';

defineProps<{ compact?: boolean }>();

const { t } = useI18n();
const sync = useSyncStore();
const failure = computed(() => SYNC_FAILURES.find((item) => item === sync.status) ?? null);

const look = computed(() => {
  if (failure.value) {
    const { icon, messageKey } = TROUBLE_LOOKS[failure.value];
    return { icon, message: t(messageKey) };
  }
  return sync.rejected > 0 ? { icon: 'sync_problem', message: t('sync.rejected', { count: sync.rejected }) } : null;
});
</script>
