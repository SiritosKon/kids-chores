<template>
  <div v-if="sync.status !== 'off'" class="row items-center no-wrap q-gutter-x-sm text-caption text-grey-5">
    <q-icon
      :name="look.icon"
      :color="look.color"
      :size="compact ? '14px' : '18px'"
      :class="{ 'sync-status__spin': sync.status === 'syncing' }"
    />
    <div class="col">
      <div :class="{ ellipsis: compact }">{{ message }}</div>
      <template v-if="!compact">
        <div v-if="sync.pending > 0 && sync.status !== 'syncing'">{{ t('sync.pending', { count: sync.pending }) }}</div>
        <div v-if="sync.rejected > 0" class="text-negative">{{ t('sync.rejected', { count: sync.rejected }) }}</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatClockTime } from '@/shared/lib/date';
import { useSyncStore } from '../model/store';
import { STATUS_LOOKS } from './constants';

defineProps<{ compact?: boolean }>();

const { t } = useI18n();
const sync = useSyncStore();
const look = computed(() => STATUS_LOOKS[sync.status]);

const message = computed((): string => {
  switch (sync.status) {
    case 'syncing':
      return t('sync.syncing');
    case 'synced':
      return t('sync.synced', { time: formatClockTime(sync.syncedAt ?? Date.now()) });
    case 'offline':
      return t('sync.offline');
    case 'failed':
      return t('sync.failed');
    case 'signedOut':
      return t('sync.signedOut');
    default:
      return '';
  }
});
</script>

<style scoped>
.sync-status__spin {
  animation: sync-status-spin 1s linear infinite;
}

@keyframes sync-status-spin {
  to {
    transform: rotate(-360deg);
  }
}
</style>
