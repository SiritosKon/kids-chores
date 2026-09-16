<template>
  <q-expansion-item icon="emoji_events" label="Награды" header-class="text-weight-medium">
    <q-list separator>
      <q-item v-for="reward in rewards" :key="reward.id">
        <q-item-section avatar>
          <q-icon :name="reward.icon" size="28px" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ reward.name }}</q-item-label>
          <q-item-label caption>{{ reward.points }} б.</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-xs">
            <q-chip
              v-for="child in children"
              :key="child.id"
              dense
              :color="isEarned(child.id, reward) ? 'primary' : 'grey-8'"
              :text-color="isEarned(child.id, reward) ? 'black' : 'grey-4'"
              :icon="isEarned(child.id, reward) ? 'check' : 'lock'"
            >
              {{ child.name }}
            </q-chip>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-expansion-item>
</template>

<script setup>
import { REWARDS } from '../config/rewards.js';
import { CHILDREN } from '../config/children.js';
import { useAllTimeTotals } from '../composables/useAllTimeTotals.js';

const rewards = REWARDS;
const children = CHILDREN;
const { totals } = useAllTimeTotals();

function isEarned(childId, reward) {
  return (totals.value[childId] || 0) >= reward.points;
}
</script>
