<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('whatsNewPage.title')" :back-to="ROUTES.home" />
    <WhatsNewList />
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { WhatsNewList } from '@/features/whats-new';

const { t } = useI18n();
</script>
