<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('settingsPage.pinTitle')" :back-to="ROUTES.settings" />
    <section class="ios-card q-pa-md">
      <PinChangeForm @done="goBack(ROUTES.settings)" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { PinChangeForm } from '@/features/edit-settings';

const { t } = useI18n();
const goBack = useGoBack();
</script>
