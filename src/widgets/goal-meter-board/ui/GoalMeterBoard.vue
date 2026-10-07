<template>
  <div v-if="childrenStore.active.length > 0 || parentActive" class="goal-meter-board ios-card">
    <GoalMeter
      v-for="entry in meterEntries"
      :key="entry.childId"
      :entry="entry"
      :editable="parentActive"
      @open-history="openHistory(entry.childId)"
      @open-streak="openStreak(entry.childId)"
      @choose-gift="chooseGift(entry.childId)"
      @claim-goal="claimGoal(entry.childId)"
      @add-goal="addGoal(entry.childId)"
      @remove-goal="removeGoal(entry.childId)"
      @edit="openEditor(entry.childId)"
    />
    <div v-if="parentActive" class="goal-meter-board__add">
      <button type="button" class="add-tile" data-tour="add-child" @click="openEditor(null)">
        <q-icon name="add" size="22px" />
        Добавить ребёнка
      </button>
    </div>
    <WalletHistoryDialog v-model="historyOpen" :child-id="historyChildId" />
    <StreakDialog v-model="streakOpen" :child-id="streakChildId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { NEW_CHILD_ID } from '@/shared/config/constants';
import { DEFAULT_METER_FIGURE } from '@/shared/ui/constants';
import { childPath, childGoalPath } from '@/shared/lib/routes';
import { useChildrenStore, childPhotoUrl, setChildGoal, type Child } from '@/entities/child';
import { useRewardsStore, getVariantPhotos, type RewardVariant } from '@/entities/reward';
import { useWalletStore, piggyMax } from '@/entities/wallet';
import { useStreakStore } from '@/entities/streak';
import { useParentSessionStore } from '@/entities/parent-session';
import { WalletHistoryDialog } from '@/features/wallet-history';
import { StreakDialog } from '@/features/streak-details';
import { useChooseVariant, usePendingChoicesStore } from '@/features/choose-reward-variant';
import { useAwardReward } from '@/features/award-reward';
import GoalMeter from './GoalMeter.vue';
import { goalEntry } from '../lib/goal';
import type { GoalEntry, MeterEntry } from '../model/types';

const wallet = useWalletStore();
const childrenStore = useChildrenStore();
const streakStore = useStreakStore();
const { active: parentActive } = storeToRefs(useParentSessionStore());
const pendingChoices = usePendingChoicesStore();
const { chooseInTurn } = useChooseVariant();
const rewardsStore = useRewardsStore();
const $q = useQuasar();
const { award } = useAwardReward();

const goalPhotos = ref<Map<string, string>>(new Map());

const goalVariantIds = computed(() =>
  childrenStore.active.flatMap((child) => (child.goal?.variantId ? [child.goal.variantId] : []))
);

watch(
  goalVariantIds,
  async (ids) => {
    goalPhotos.value = ids.length > 0 ? await getVariantPhotos(ids) : new Map();
  },
  { immediate: true }
);

const goalVariant = (child: Child): RewardVariant | undefined =>
  child.goal?.variantId
    ? rewardsStore.variantsOf(child.goal.rewardId).find((variant) => variant.id === child.goal?.variantId)
    : undefined;

const goalOf = (child: Child, balance: number): GoalEntry | null => {
  const variant = goalVariant(child);
  const reward = child.goal ? rewardsStore.byId(child.goal.rewardId) : undefined;
  return goalEntry(reward, variant, balance, variant ? (goalPhotos.value.get(variant.id) ?? '') : '');
};

const claimGoal = async (childId: string): Promise<void> => {
  const child = childrenStore.byId(childId);
  const reward = child?.goal ? rewardsStore.byId(child.goal.rewardId) : undefined;
  if (!child || !reward) {
    return;
  }
  if (await award(child, reward, goalVariant(child) ?? null)) {
    await setChildGoal(child.id, undefined);
  }
};

const meterEntries = computed<MeterEntry[]>(() =>
  childrenStore.active.map((child) => {
    const balance = wallet.balanceOf(child.id);
    const max = piggyMax(balance);
    return {
      childId: child.id,
      name: child.name,
      photo: childPhotoUrl(child.photo) ?? '',
      carColor: child.carColor,
      figure: child.figure ?? DEFAULT_METER_FIGURE,
      balance,
      ratio: max > 0 ? balance / max : 0,
      streak: streakStore.currentOf(child.id),
      pendingChoices: pendingChoices.pendingOf(child.id).length,
      goal: goalOf(child, balance),
    };
  })
);

const historyOpen = ref(false);
const historyChildId = ref<string | null>(null);

const openHistory = (childId: string): void => {
  historyChildId.value = childId;
  historyOpen.value = true;
};

const streakOpen = ref(false);
const streakChildId = ref<string | null>(null);

const openStreak = (childId: string): void => {
  streakChildId.value = childId;
  streakOpen.value = true;
};

const chooseGift = (childId: string): Promise<void> => chooseInTurn(pendingChoices.pendingOf(childId));

const router = useRouter();

const openEditor = (childId: string | null): void => {
  void router.push(childPath(childId ?? NEW_CHILD_ID));
};

const addGoal = (childId: string): void => {
  void router.push(childGoalPath(childId));
};

const removeGoal = (childId: string): void => {
  const child = childrenStore.byId(childId);
  const reward = child?.goal ? rewardsStore.byId(child.goal.rewardId) : undefined;
  if (!child) {
    return;
  }
  $q.dialog({
    title: 'Убрать цель',
    message: `${child.name} больше не копит на «${reward?.name ?? 'цель'}». Баллы останутся в копилке.`,
    cancel: { flat: true, noCaps: true, label: 'Отмена' },
    ok: { flat: true, noCaps: true, color: 'negative', label: 'Убрать' },
    persistent: true,
  }).onOk(() => setChildGoal(child.id, undefined));
};
</script>

<style scoped>
.goal-meter-board {
  display: flex;
  flex-direction: column;
}

.goal-meter-board > :not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.goal-meter-board__add {
  padding: 12px 16px;
}
</style>
