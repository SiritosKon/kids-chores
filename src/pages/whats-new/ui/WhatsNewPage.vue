<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader title="Что нового" :back-to="ROUTES.home" />
    <WhatsNewList />
  </q-page>
</template>

<script setup lang="ts">
import { ROUTES } from '@/shared/config/constants';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { WhatsNewList } from '@/features/whats-new';
</script>
