<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader title="Как добавить на экран «Домой»" :back-to="ROUTES.home" />
    <InstallGuide @done="goBack(ROUTES.home)" />
  </q-page>
</template>

<script setup lang="ts">
import { ROUTES } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { InstallGuide } from '@/features/install-app';

const goBack = useGoBack();
</script>
