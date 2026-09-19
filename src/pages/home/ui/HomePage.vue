<template>
  <q-page class="q-pa-md">
    <GoalMeterBoard class="q-mb-lg" />

    <div class="row items-center q-mb-sm">
      <div class="text-subtitle1 text-weight-bold">Задачи</div>
      <q-space />
      <DateSelector v-model="selectedDate" />
    </div>

    <TasksBoard :selected-date="selectedDate" />

    <div class="ios-card q-mt-lg q-mb-lg">
      <RewardsPanel />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { GoalMeterBoard } from '@/widgets/goal-meter-board';
import { TasksBoard } from '@/widgets/tasks-board';
import { RewardsPanel } from '@/widgets/rewards-panel';
import { DateSelector, useSelectedDateStore } from '@/features/select-date';

const { selectedDate } = storeToRefs(useSelectedDateStore());
</script>
