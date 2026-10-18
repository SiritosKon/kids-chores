<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="child ? 'Ребёнок' : 'Новый ребёнок'" :back-to="ROUTES.home" />
    <template v-if="childrenStore.loaded">
      <section v-if="parentActive" class="ios-card q-pa-md">
        <ChildEditForm
          :key="childId"
          :child="child"
          :open-goal="openGoal"
          @done="close"
          @cancel="close"
          @create-reward="createReward"
        />
      </section>
      <section v-else-if="child" class="ios-card q-pa-md child-card">
        <q-avatar size="72px" color="grey-9">
          <img v-if="photo" :src="photo" :alt="child.name" />
          <MeterFigure v-else :kind="child.figure ?? DEFAULT_METER_FIGURE" :color="child.carColor" :size="52" />
        </q-avatar>
        <div class="text-h5 text-weight-bold ellipsis">{{ child.name }}</div>
      </section>
      <WalletHistory v-if="child" :child-id="child.id" class="q-mt-md" />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { ROUTES, NEW_CHILD_ID, GOAL_QUERY_KEY } from '@/shared/config/constants';
import { DEFAULT_METER_FIGURE } from '@/shared/ui/constants';
import { childRewardPath } from '@/shared/lib/routes';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import MeterFigure from '@/shared/ui/MeterFigure.vue';
import { useChildrenStore, childPhotoUrl } from '@/entities/child';
import { useParentSessionStore } from '@/entities/parent-session';
import { ChildEditForm } from '@/features/edit-child';
import { WalletHistory } from '@/features/wallet-history';

const route = useRoute();
const router = useRouter();
const goBack = useGoBack();
const childrenStore = useChildrenStore();
const { active: parentActive } = storeToRefs(useParentSessionStore());

const childId = computed(() => String(route.params.childId ?? NEW_CHILD_ID));

const openGoal = computed(() => route.query[GOAL_QUERY_KEY] === '1');

const child = computed(() =>
  childId.value === NEW_CHILD_ID ? null : (childrenStore.active.find((row) => row.id === childId.value) ?? null)
);

const photo = computed(() => (child.value ? childPhotoUrl(child.value.photo) : undefined));

const unavailable = computed(
  () => childrenStore.loaded && (childId.value === NEW_CHILD_ID ? !parentActive.value : !child.value)
);

watch(
  unavailable,
  (leave) => {
    if (leave) {
      void router.replace(ROUTES.home);
    }
  },
  { immediate: true }
);

const close = (): void => {
  goBack(ROUTES.home);
};

const createReward = (): void => {
  void router.push(childRewardPath(childId.value));
};
</script>

<style scoped>
.child-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
