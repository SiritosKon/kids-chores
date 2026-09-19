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

<script setup>
import { storeToRefs } from 'pinia';
import GoalMeterBoard from '../components/GoalMeterBoard.vue';
import TasksBoard from '../components/TasksBoard.vue';
import { DateSelector, useSelectedDateStore } from '@/features/select-date';
import RewardsPanel from '../components/RewardsPanel.vue';

const { selectedDate } = storeToRefs(useSelectedDateStore());
</script>
