<template>
  <div class="goal-meter-board">
    <GoalMeter v-for="entry in progress" :key="entry.childId" :entry="entry" />
  </div>
</template>

<script setup>
import GoalMeter from './GoalMeter.vue';
import { useWeeklyProgress } from '../composables/useProgress.js';

const { progress } = useWeeklyProgress();
</script>

<style scoped>
.goal-meter-board {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
