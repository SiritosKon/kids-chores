<template>
  <q-expansion-item icon="emoji_events" label="Награды" header-class="text-weight-medium">
    <div v-if="!ready" class="q-pa-md">
      <q-skeleton type="text" width="60%" />
    </div>
    <div v-else-if="rewards.length === 0 && !parentActive" class="q-pa-md text-grey-5">
      Наград пока нет. Добавьте их в родительском режиме.
    </div>
    <q-list v-else separator>
      <q-item v-for="reward in rewards" :key="reward.id" :clickable="parentActive" @click="openEditor(reward)">
        <q-item-section avatar>
          <div class="reward-tile" :style="{ background: rewardColor(reward) }">
            <q-icon :name="reward.icon" size="20px" color="white" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ reward.name }}
            <q-icon v-if="parentActive" name="edit" size="14px" color="grey-5" class="q-ml-xs" />
          </q-item-label>
          <q-item-label caption>
            {{ reward.points }} б.
            <template v-if="parentActive && reward.visibility !== 'shop'">
              · {{ REWARD_VISIBILITY_LABELS[reward.visibility] }}
            </template>
            <template v-if="parentActive && !reward.purchasable"> · не продаётся</template>
          </q-item-label>
        </q-item-section>
        <q-item-section v-if="reward.purchasable" side @click.stop>
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
      <q-item v-if="parentActive">
        <q-item-section>
          <button type="button" class="add-tile" data-tour="add-reward" @click="openEditor(null)">
            <q-icon name="add" size="22px" />
            Добавить награду
          </button>
        </q-item-section>
      </q-item>
    </q-list>
    <RewardEditDialog v-model="editorOpen" :reward="editedReward" />
  </q-expansion-item>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useChildrenStore, childPhotoUrl, type Child } from '@/entities/child';
import {
  useRewardsStore,
  rewardColor,
  REWARD_VISIBILITY_LABELS,
  type Reward,
} from '@/entities/reward';
import { useWalletStore } from '@/entities/wallet';
import { useParentSessionStore } from '@/entities/parent-session';
import { useAwardReward } from '@/features/award-reward';
import { RewardEditDialog } from '@/features/edit-reward';

const childrenStore = useChildrenStore();
const rewardsStore = useRewardsStore();
const wallet = useWalletStore();
const { award } = useAwardReward();

const ready = computed(() => childrenStore.loaded && rewardsStore.loaded);
const { active: parentActive } = storeToRefs(useParentSessionStore());
const rewards = computed(() => (parentActive.value ? rewardsStore.active : rewardsStore.shop));
const children = computed(() => childrenStore.active);

const photoUrl = (child: Child): string | undefined => childPhotoUrl(child.photo);

const canAfford = (child: Child, reward: Reward): boolean =>
  reward.purchasable && wallet.balanceOf(child.id) >= reward.points;

const anyCanAfford = (reward: Reward): boolean =>
  children.value.some((child) => canAfford(child, reward));

const editorOpen = ref(false);
const editedReward = ref<Reward | null>(null);

const openEditor = (reward: Reward | null): void => {
  if (!parentActive.value) {
    return;
  }
  editedReward.value = reward;
  editorOpen.value = true;
};
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
