<template>
  <div v-if="childrenStore.active.length > 0 || parentActive" class="goal-meter-board">
    <GoalMeter
      v-for="entry in meterEntries"
      :key="entry.childId"
      :entry="entry"
      :editable="parentActive"
      @open-history="openHistory(entry.childId)"
      @open-streak="openStreak(entry.childId)"
      @edit="openEditor(entry.childId)"
    />
    <button v-if="parentActive" type="button" class="add-tile" data-tour="add-child" @click="openEditor(null)">
      <q-icon name="add" size="22px" />
      Добавить ребёнка
    </button>
    <WalletHistoryDialog v-model="historyOpen" :child-id="historyChildId" />
    <StreakDialog v-model="streakOpen" :child-id="streakChildId" />
    <ChildEditDialog v-model="editorOpen" :child="editedChild" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useChildrenStore, childPhotoUrl, type Child } from '@/entities/child';
import { useWalletStore, piggyMax } from '@/entities/wallet';
import { useStreakStore } from '@/entities/streak';
import { useParentSessionStore } from '@/entities/parent-session';
import { WalletHistoryDialog } from '@/features/wallet-history';
import { StreakDialog } from '@/features/streak-details';
import { ChildEditDialog } from '@/features/edit-child';
import GoalMeter from './GoalMeter.vue';
import type { MeterEntry } from '../model/types';

const wallet = useWalletStore();
const childrenStore = useChildrenStore();
const streakStore = useStreakStore();
const { active: parentActive } = storeToRefs(useParentSessionStore());

const meterEntries = computed<MeterEntry[]>(() =>
  childrenStore.active.map((child) => {
    const balance = wallet.balanceOf(child.id);
    const max = piggyMax(balance);
    return {
      childId: child.id,
      name: child.name,
      photo: childPhotoUrl(child.photo) ?? '',
      carColor: child.carColor,
      balance,
      ratio: max > 0 ? balance / max : 0,
      streak: streakStore.currentOf(child.id),
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

const editorOpen = ref(false);
const editedChild = ref<Child | null>(null);

const openEditor = (childId: string | null): void => {
  editedChild.value = childId ? (childrenStore.byId(childId) ?? null) : null;
  editorOpen.value = true;
};
</script>

<style scoped>
.goal-meter-board {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
