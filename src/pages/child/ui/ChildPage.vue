<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="child ? 'Ребёнок' : 'Новый ребёнок'" :back-to="ROUTES.home" />
    <section v-if="childrenStore.loaded" class="ios-card q-pa-md">
      <ChildEditForm :key="childId" :child="child" @done="close" @cancel="close" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROUTES, NEW_CHILD_ID } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { useChildrenStore } from '@/entities/child';
import { ChildEditForm } from '@/features/edit-child';

const route = useRoute();
const router = useRouter();
const goBack = useGoBack();
const childrenStore = useChildrenStore();

const childId = computed(() => String(route.params.childId ?? NEW_CHILD_ID));

const child = computed(() =>
  childId.value === NEW_CHILD_ID ? null : (childrenStore.active.find((row) => row.id === childId.value) ?? null)
);

watch(
  () => childrenStore.loaded,
  (loaded) => {
    if (loaded && childId.value !== NEW_CHILD_ID && !child.value) {
      void router.replace(ROUTES.home);
    }
  },
  { immediate: true }
);

const close = (): void => {
  goBack(ROUTES.home);
};
</script>
