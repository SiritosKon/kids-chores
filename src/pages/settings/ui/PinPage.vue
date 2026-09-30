<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader title="Смена PIN" :back-to="ROUTES.settings" />
    <section class="ios-card q-pa-md">
      <PinChangeForm @done="goBack(ROUTES.settings)" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ROUTES } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { PinChangeForm } from '@/features/edit-settings';

const goBack = useGoBack();
</script>
