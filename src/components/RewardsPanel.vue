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
          <q-btn-dropdown
            color="primary"
            label="Наградить"
            icon="redeem"
            no-caps
            rounded
            unelevated
            dense
            :disable="!anyCanAfford(reward)"
          >
            <q-list style="min-width: 200px">
              <q-item
                v-for="child in children"
                :key="child.id"
                clickable
                v-close-popup
                :disable="!canAfford(child, reward)"
                @click="reward && award(child, reward)"
              >
                <q-item-section avatar>
                  <q-avatar size="32px" color="grey-9">
                    <img v-if="child.photo" :src="child.photo" :alt="child.name" />
                    <q-icon v-else name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ child.name }}</q-item-label>
                  <q-item-label caption>Баланс: {{ balances[child.id] || 0 }} б.</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
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

function canAfford(child, reward) {
  return (balances.value[child.id] || 0) >= reward.points;
}

function anyCanAfford(reward) {
  return children.some((child) => canAfford(child, reward));
}

function award(child, reward) {
  $q.dialog({
    title: 'Наградить',
    message: `Выдать «${reward.name}» для ${child.name} за ${reward.points} б.?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await addSpend(child.id, reward.id, reward.points);
    $q.notify({ type: 'positive', message: `${child.name}: выдано «${reward.name}»` });
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
