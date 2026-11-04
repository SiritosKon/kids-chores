<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('installPage.title')" :back-to="ROUTES.home" />
    <InstallGuide @done="goBack(ROUTES.home)" />
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { InstallGuide } from '@/features/install-app';

const { t } = useI18n();
const goBack = useGoBack();
</script>
