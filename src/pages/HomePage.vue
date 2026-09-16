<template>
  <q-page class="q-pa-md">
    <GoalMeterBoard class="q-mb-lg" />

    <div class="row items-center no-wrap q-mb-md">
      <q-btn-toggle
        v-model="tab"
        :options="childOptions"
        class="ios-segment"
        no-caps
        unelevated
        toggle-color="primary"
        toggle-text-color="black"
        color="transparent"
        text-color="grey-5"
      />
      <q-space />
      <DateSelector v-model="selectedDate" />
    </div>

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel v-for="child in children" :key="child.id" :name="child.id" class="q-pa-none">
        <ChildChecklist :child="child" :selected-date="selectedDate" />
      </q-tab-panel>
    </q-tab-panels>

    <div class="ios-card q-mt-lg">
      <RewardsPanel />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import GoalMeterBoard from '../components/GoalMeterBoard.vue';
import ChildChecklist from '../components/ChildChecklist.vue';
import DateSelector from '../components/DateSelector.vue';
import RewardsPanel from '../components/RewardsPanel.vue';
import { CHILDREN } from '../config/children.js';
import { useSelectedDate } from '../composables/useSelectedDate.js';

const children = CHILDREN;
const tab = ref(CHILDREN[0].id);
const { selectedDate } = useSelectedDate();

const childOptions = computed(() => CHILDREN.map((child) => ({ label: child.name, value: child.id })));
</script>

<style scoped>
.ios-segment {
  background: #2c2c2e;
  border-radius: 9px;
  padding: 2px;
}

.ios-segment :deep(.q-btn) {
  border-radius: 7px;
  min-height: 32px;
  padding: 0 16px;
  font-weight: 600;
}
</style>
