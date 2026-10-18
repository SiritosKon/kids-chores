<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader title="История списаний" :back-to="ROUTES.home" />
    <SpendsHistory />
  </q-page>
</template>

<script setup lang="ts">
import { ROUTES } from '@/shared/config/constants';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { SpendsHistory } from '@/features/rollback-spend';
</script>
