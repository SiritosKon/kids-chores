<template>
  <q-dialog :model-value="open" persistent>
    <q-card class="dialog--form">
      <q-card-section class="row items-center no-wrap">
        <div class="text-h6 col">{{ t('joinFamily.inviteTitle') }}</div>
        <q-btn flat round dense icon="close" :aria-label="t('common.close')" @click="invite.dismiss()" />
      </q-card-section>
      <q-card-section class="q-pt-none">
        <PendingInvite />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccountStore } from '@/entities/account';
import { usePendingInviteStore } from '../model/store';
import PendingInvite from './PendingInvite.vue';

const { t } = useI18n();
const account = useAccountStore();
const invite = usePendingInviteStore();
const open = computed(() => account.signedIn && invite.token !== null);
</script>
