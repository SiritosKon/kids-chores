<template>
  <q-expansion-item icon="emoji_events" label="Награды" header-class="text-weight-medium">
    <q-list separator>
      <q-item v-for="reward in rewards" :key="reward.id">
        <q-item-section avatar>
          <div class="reward-tile">
            <q-icon :name="reward.icon" size="20px" color="white" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ reward.name }}</q-item-label>
          <q-item-label caption>{{ reward.points }} б.</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn
              v-for="(child, index) in children"
              :key="child.id"
              dense
              rounded
              unelevated
              no-caps
              size="sm"
              :color="canBuy(child, reward) ? childColor(index) : 'grey-8'"
              :text-color="canBuy(child, reward) ? 'white' : 'grey-5'"
              :icon="canBuy(child, reward) ? 'shopping_cart' : 'lock'"
              :disable="!canBuy(child, reward)"
              :label="child.name"
              @click="buy(child, reward)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-expansion-item>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { REWARDS } from '../config/rewards.js';
import { CHILDREN } from '../config/children.js';
import { useBalances } from '../composables/useBalances.js';
import { addSpend } from '../db/spendsRepo.js';

const $q = useQuasar();
const rewards = REWARDS;
const children = CHILDREN;
const { balances } = useBalances();

const CHILD_COLORS = ['blue', 'red'];

function childColor(index) {
  return CHILD_COLORS[index] || 'primary';
}

function canBuy(child, reward) {
  return (balances.value[child.id] || 0) >= reward.points;
}

function buy(child, reward) {
  $q.dialog({
    title: 'Награда',
    message: `Купить «${reward.name}» для ${child.name} за ${reward.points} б.?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await addSpend(child.id, reward.id, reward.points);
    $q.notify({ type: 'positive', message: `${child.name}: куплено «${reward.name}»` });
  });
}
</script>

<style scoped>
.reward-tile {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--q-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
