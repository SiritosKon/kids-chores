<template>
  <div v-if="childrenStore.active.length > 0" class="goal-meter-board">
    <GoalMeter
      v-for="entry in meterEntries"
      :key="entry.childId"
      :entry="entry"
      @open-history="openHistory(entry.childId)"
    />
    <WalletHistoryDialog v-model="historyOpen" :child-id="historyChildId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { WalletHistoryDialog } from '@/features/wallet-history';
import { useChildrenStore, childPhotoUrl } from '@/entities/child';
import { useWalletStore, piggyMax } from '@/entities/wallet';
import GoalMeter from './GoalMeter.vue';
import type { MeterEntry } from '../model/meterEntry';

const wallet = useWalletStore();
const childrenStore = useChildrenStore();

const meterEntries = computed<MeterEntry[]>(() =>
  childrenStore.active.map((child) => {
    const balance = wallet.balanceOf(child.id);
    const max = piggyMax(balance);
    return {
      childId: child.id,
      name: child.name,
      photo: childPhotoUrl(child.photo) ?? '',
      carColor: child.carColor,
      balance,
      ratio: max > 0 ? balance / max : 0,
    };
  })
);

const historyOpen = ref(false);
const historyChildId = ref<string | null>(null);

const openHistory = (childId: string): void => {
  historyChildId.value = childId;
  historyOpen.value = true;
};
</script>

<style scoped>
.goal-meter-board {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
