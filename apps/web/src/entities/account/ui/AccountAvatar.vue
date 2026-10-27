<template>
  <q-avatar :size="size" :color="account.photo ? undefined : initial ? 'primary' : 'grey-9'" text-color="black">
    <img v-if="account.photo" :src="account.photo" alt="" />
    <span v-else-if="initial" class="text-weight-bold">{{ initial }}</span>
    <q-icon v-else name="person" color="grey-5" />
  </q-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAccountStore } from '../model/store';
import { nameInitial } from '../lib/initial';

defineProps<{ size: string }>();

const account = useAccountStore();
const initial = computed(() => (account.name ? nameInitial(account.name) : ''));
</script>
