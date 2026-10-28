<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('spendsPage.title')" :back-to="ROUTES.home" />
    <SpendsHistory />
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { SpendsHistory } from '@/features/rollback-spend';

const { t } = useI18n();
</script>
