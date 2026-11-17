<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('childPage.streak', { name: child?.name ?? '' })" :back-to="ROUTES.home" />
    <StreakDetails v-if="child" :child-id="child.id" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { useChildrenStore } from '@/entities/child';
import { StreakDetails } from '@/features/streak-details';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const childrenStore = useChildrenStore();

const child = computed(() => childrenStore.active.find((row) => row.id === String(route.params.childId)) ?? null);

watch(
  () => childrenStore.loaded && !child.value,
  (missing) => {
    if (missing) {
      void router.replace(ROUTES.home);
    }
  },
  { immediate: true }
);
</script>
