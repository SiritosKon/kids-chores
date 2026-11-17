<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('settingsPage.pinTitle')" :back-to="ROUTES.settings" />
    <section class="ios-card q-pa-md">
      <PinResetForm v-if="forgot" @done="goBack(ROUTES.settings)" @cancel="forgot = false" />
      <template v-else>
        <PinChangeForm @done="goBack(ROUTES.settings)" />
        <div class="row justify-center">
          <q-btn flat dense no-caps color="grey-5" :label="t('parentLogin.forgotCurrent')" @click="forgot = true" />
        </div>
      </template>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { PinChangeForm } from '@/features/edit-settings';
import { PinResetForm } from '@/features/parent-login';

const { t } = useI18n();
const goBack = useGoBack();
const forgot = ref(false);
</script>
