<template>
  <q-expansion-item icon="emoji_events" label="Награды" header-class="text-weight-medium">
    <div v-if="!ready" class="q-pa-md">
      <q-skeleton type="text" width="60%" />
    </div>
    <div v-else-if="rewards.length === 0" class="q-pa-md text-grey-5">
      Наград пока нет. Добавьте их в родительском режиме.
    </div>
    <q-list v-else separator>
      <q-item v-for="reward in rewards" :key="reward.id">
        <q-item-section avatar>
          <div class="reward-tile" :style="{ background: rewardColor(reward) }">
            <q-icon :name="reward.icon" size="20px" color="white" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ reward.name }}</q-item-label>
          <q-item-label caption>{{ reward.points }} б.</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn-dropdown
            :color="anyCanAfford(reward) ? 'primary' : 'grey-8'"
            :text-color="anyCanAfford(reward) ? 'white' : 'grey-5'"
            label="Наградить"
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
                    <img v-if="photoUrl(child)" :src="photoUrl(child)" :alt="child.name" />
                    <q-icon v-else name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ child.name }}</q-item-label>
                  <q-item-label caption>Баланс: {{ wallet.balanceOf(child.id) }} б.</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>
    </q-list>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useChildrenStore, childPhotoUrl, type Child } from '@/entities/child';
import { useRewardsStore, rewardColor, type Reward } from '@/entities/reward';
import { useWalletStore } from '@/entities/wallet';
import { useAwardReward } from '@/features/award-reward';

const childrenStore = useChildrenStore();
const rewardsStore = useRewardsStore();
const wallet = useWalletStore();
const { award } = useAwardReward();

const ready = computed(() => childrenStore.loaded && rewardsStore.loaded);
const rewards = computed(() => rewardsStore.shop);
const children = computed(() => childrenStore.active);

const photoUrl = (child: Child): string | undefined => childPhotoUrl(child.photo);

const canAfford = (child: Child, reward: Reward): boolean =>
  reward.purchasable && wallet.balanceOf(child.id) >= reward.points;

const anyCanAfford = (reward: Reward): boolean =>
  children.value.some((child) => canAfford(child, reward));
</script>

<style scoped>
.reward-tile {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
