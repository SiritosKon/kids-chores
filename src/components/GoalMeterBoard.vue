<template>
  <div class="goal-meter-board">
    <GoalMeter v-for="entry in meterEntries" :key="entry.childId" :entry="entry" />
  </div>
</template>

<script setup>
import GoalMeter from './GoalMeter.vue';
import { useBalances } from '../composables/useBalances.js';

const { meterEntries } = useBalances();
</script>

<style scoped>
.goal-meter-board {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
