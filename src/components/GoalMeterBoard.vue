<template>
  <div class="goal-meter-board">
    <GoalMeter
      v-for="entry in meterEntries"
      :key="entry.childId"
      :entry="entry"
      @open-history="openHistory(entry.childId)"
    />
    <WalletHistoryDialog v-model="historyOpen" :child-id="historyChildId" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GoalMeter from './GoalMeter.vue';
import WalletHistoryDialog from './WalletHistoryDialog.vue';
import { useBalances } from '../composables/useBalances.js';

const { meterEntries } = useBalances();

const historyOpen = ref(false);
const historyChildId = ref(null);

function openHistory(childId) {
  historyChildId.value = childId;
  historyOpen.value = true;
}
</script>

<style scoped>
.goal-meter-board {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
