<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('settingsPage.pinTitle')" :back-to="ROUTES.settings" />
    <section class="ios-card q-pa-md">
      <PinResetForm @done="onChanged" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { PinResetForm } from '@/features/parent-login';

const $q = useQuasar();
const { t } = useI18n();
const goBack = useGoBack();

const onChanged = (): void => {
  $q.notify({ type: 'positive', message: t('settingsPage.pinChanged') });
  goBack(ROUTES.settings);
};
</script>
