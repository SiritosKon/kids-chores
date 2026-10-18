<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('childPage.wallet', { name: child?.name ?? '' })" :back-to="ROUTES.home">
      <template v-if="child" #leading>
        <q-avatar size="36px" color="grey-9">
          <img v-if="photo" :src="photo" :alt="child.name" />
          <MeterFigure v-else :kind="child.figure ?? DEFAULT_METER_FIGURE" :color="child.carColor" :size="26" />
        </q-avatar>
      </template>
    </PageHeader>
    <WalletHistory v-if="child" :child-id="child.id" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import { DEFAULT_METER_FIGURE } from '@/shared/ui/constants';
import PageHeader from '@/shared/ui/PageHeader.vue';
import MeterFigure from '@/shared/ui/MeterFigure.vue';
import { useChildrenStore, childPhotoUrl } from '@/entities/child';
import { WalletHistory } from '@/features/wallet-history';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const childrenStore = useChildrenStore();

const child = computed(() => childrenStore.active.find((row) => row.id === String(route.params.childId)) ?? null);

const photo = computed(() => (child.value ? childPhotoUrl(child.value.photo) : undefined));

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
