<template>
  <q-page class="q-pa-lg">
    <GoalMeterBoard class="q-mb-xl" />

    <div class="row items-center no-wrap q-mb-sm">
      <q-tabs
        v-model="tab"
        class="col text-primary"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
        inline-label
      >
        <q-tab v-for="child in children" :key="child.id" :name="child.id" :label="child.name" no-caps />
      </q-tabs>
      <DateSelector v-model="selectedDate" />
    </div>
    <q-separator />

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel v-for="child in children" :key="child.id" :name="child.id" class="q-px-none q-py-md">
        <ChildChecklist :child="child" :selected-date="selectedDate" />
      </q-tab-panel>
    </q-tab-panels>

    <q-separator class="q-my-lg" />
    <RewardsPanel />
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import GoalMeterBoard from '../components/GoalMeterBoard.vue';
import ChildChecklist from '../components/ChildChecklist.vue';
import DateSelector from '../components/DateSelector.vue';
import RewardsPanel from '../components/RewardsPanel.vue';
import { CHILDREN } from '../config/children.js';
import { useSelectedDate } from '../composables/useSelectedDate.js';

const children = CHILDREN;
const tab = ref(CHILDREN[0].id);
const { selectedDate } = useSelectedDate();
</script>
