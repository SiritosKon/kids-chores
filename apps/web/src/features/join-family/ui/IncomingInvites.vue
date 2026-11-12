<template>
  <q-list v-if="invites.length > 0">
    <q-item v-for="invite in invites" :key="invite.id" class="q-py-md">
      <q-item-section avatar><q-icon name="group_add" color="primary" /></q-item-section>
      <q-item-section>
        <q-item-label>{{ t('joinFamily.invite', { name: invite.inviterName ?? t('joinFamily.someone') }) }}</q-item-label>
        <q-item-label caption>{{ t('joinFamily.inviteCaption', { date: formatTimestampLong(Date.parse(invite.expiresAt)) }) }}</q-item-label>
        <div class="row q-gutter-sm q-mt-sm">
          <q-btn unelevated no-caps dense color="primary" class="q-px-md" :label="t('joinFamily.accept')" :loading="busy === invite.id" @click="accept(invite.id)" />
          <q-btn flat no-caps dense color="grey-5" class="q-px-md" :label="t('joinFamily.decline')" :disable="busy !== null" @click="decline(invite.id)" />
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { formatTimestampLong } from '@/shared/lib/date';
import { acceptInvite, dropInvite, useAccountStore } from '@/entities/account';

const props = withDefaults(defineProps<{ confirm?: boolean }>(), { confirm: true });
const emit = defineEmits<{ joined: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();
const invites = computed(() => account.me?.invites ?? []);
const busy = ref<string | null>(null);

const confirmed = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (!props.confirm) {
      resolve(true);
      return;
    }
    const alone = (account.me?.members ?? 1) < 2;
    $q.dialog({
      title: t('joinFamily.acceptTitle'),
      message: alone ? t('joinFamily.acceptAlone') : t('joinFamily.acceptShared'),
      cancel: { flat: true, noCaps: true, label: t('common.cancel') },
      ok: { flat: true, noCaps: true, color: 'primary', label: t('joinFamily.acceptConfirm') },
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false));
  });

const accept = async (id: string): Promise<void> => {
  if (busy.value !== null || !(await confirmed())) {
    return;
  }
  busy.value = id;
  const done = await acceptInvite(id);
  if (done) {
    await account.refresh();
    $q.notify({ type: 'positive', message: t('joinFamily.joined') });
    emit('joined');
  } else {
    $q.notify({ type: 'negative', message: t('joinFamily.failed') });
  }
  busy.value = null;
};

const decline = async (id: string): Promise<void> => {
  busy.value = id;
  if (!(await dropInvite(id))) {
    $q.notify({ type: 'negative', message: t('joinFamily.failed') });
  }
  await account.refresh();
  busy.value = null;
};
</script>
