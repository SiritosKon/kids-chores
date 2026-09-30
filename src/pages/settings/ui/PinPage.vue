<template>
  <q-page class="q-pa-md settings-page">
    <SettingsHeader title="Смена PIN" :back-to="ROUTES.settings" />
    <section class="ios-card q-pa-md">
      <PinChangeForm @done="goBack(ROUTES.settings)" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ROUTES } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import { PinChangeForm } from '@/features/edit-settings';
import SettingsHeader from './SettingsHeader.vue';

const goBack = useGoBack();
</script>
