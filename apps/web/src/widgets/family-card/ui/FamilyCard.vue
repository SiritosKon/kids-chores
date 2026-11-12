<template>
  <section class="ios-card q-mb-lg">
    <div v-if="family === null" class="q-pa-md text-grey-5">
      <q-spinner v-if="loading" color="primary" size="24px" />
      <span v-else>{{ t('familyCard.offline') }}</span>
    </div>

    <q-list v-else separator>
      <q-item v-for="member in family.members" :key="member.userId">
        <q-item-section avatar>
          <q-avatar color="grey-9" text-color="white" size="40px">{{ initial(member.name) }}</q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ member.name ?? t('familyCard.noName') }}</q-item-label>
          <q-item-label caption>{{ memberCaption(member) }}</q-item-label>
        </q-item-section>
        <q-item-section v-if="account.owner && !member.you" side>
          <q-btn flat round dense icon="person_remove" color="grey-5" :aria-label="t('familyCard.remove')" :disable="busy" @click="remove(member)" />
        </q-item-section>
      </q-item>

      <q-item v-for="request in family.requests" :key="request.id">
        <q-item-section avatar><q-icon name="person_add" color="warning" /></q-item-section>
        <q-item-section>
          <q-item-label>{{ t('familyCard.request', { name: request.name ?? t('familyCard.noName') }) }}</q-item-label>
          <q-item-label caption>{{ t('familyCard.requestCaption') }}</q-item-label>
          <div class="row q-gutter-sm q-mt-sm">
            <q-btn unelevated dense no-caps color="primary" class="q-px-md" :label="t('familyCard.approve')" :disable="busy" @click="approve(request)" />
            <q-btn flat dense no-caps color="grey-5" class="q-px-md" :label="t('familyCard.decline')" :disable="busy" @click="decline(request.id)" />
          </div>
        </q-item-section>
      </q-item>

      <q-item v-for="invite in family.invites" :key="invite.id">
        <q-item-section avatar><q-icon name="qr_code_2" color="grey-5" /></q-item-section>
        <q-item-section>
          <q-item-label>{{ t('familyCard.inviteLink') }}</q-item-label>
          <q-item-label caption>{{ t('familyCard.invitedUntil', { date: formatDate(invite.expiresAt) }) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round dense icon="close" color="grey-5" :aria-label="t('familyCard.cancelInvite')" :disable="busy" @click="cancel(invite.id)" />
        </q-item-section>
      </q-item>

      <q-item v-if="account.owner" clickable :disable="busy" @click="inviting = true">
        <q-item-section avatar><q-icon name="group_add" color="primary" /></q-item-section>
        <q-item-section class="text-primary">{{ t('familyCard.invite') }}</q-item-section>
      </q-item>
      <q-item v-if="family.members.length > 1" clickable :disable="busy" @click="leave">
        <q-item-section avatar><q-icon name="logout" /></q-item-section>
        <q-item-section>{{ t('familyCard.leave') }}</q-item-section>
      </q-item>
      <q-item v-else clickable :disable="busy" @click="joining = true">
        <q-item-section avatar><q-icon name="diversity_3" /></q-item-section>
        <q-item-section>{{ t('familyCard.join') }}</q-item-section>
      </q-item>
    </q-list>

    <InviteDialog v-model="inviting" @invited="load" />
    <JoinRequestDialog v-model="joining" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { FamilyMember, FamilyResponse, JoinRequest } from '@kids-chores/contracts';
import { formatTimestampLong } from '@/shared/lib/date';
import {
  approveRequest,
  declineRequest,
  dropInvite,
  fetchFamily,
  removeMember,
  useAccountStore,
} from '@/entities/account';
import { InviteDialog } from '@/features/family-invite';
import { JoinRequestDialog } from '@/features/join-family';
import { useSyncStore } from '@/features/sync';

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();
const sync = useSyncStore();
const family = ref<FamilyResponse | null>(null);
const loading = ref(true);
const busy = ref(false);
const inviting = ref(false);
const joining = ref(false);

const load = async (): Promise<void> => {
  loading.value = true;
  family.value = await fetchFamily();
  loading.value = false;
};

onMounted(load);
watch(() => account.me?.familyId, load);

const initial = (name: string | null): string => (name ?? '?').slice(0, 1).toUpperCase();

const formatDate = (iso: string): string => formatTimestampLong(Date.parse(iso));

const memberCaption = (member: FamilyMember): string =>
  [member.you ? t('familyCard.you') : null, member.role === 'owner' ? t('familyCard.owner') : t('familyCard.parent')]
    .filter((part) => part !== null)
    .join(' · ');

const ask = (title: string, message: string, confirm: string, color = 'primary'): Promise<boolean> =>
  new Promise((resolve) => {
    $q.dialog({
      title,
      message,
      cancel: { flat: true, noCaps: true, label: t('common.cancel') },
      ok: { flat: true, noCaps: true, color, label: confirm },
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false));
  });

const act = async (request: () => Promise<boolean>): Promise<void> => {
  busy.value = true;
  if (!(await request())) {
    $q.notify({ type: 'negative', message: t('familyCard.failed') });
  }
  await Promise.all([load(), account.refresh()]);
  busy.value = false;
};

const approve = async (request: JoinRequest): Promise<void> => {
  const name = request.name ?? t('familyCard.noName');
  if (await ask(t('familyCard.approveTitle'), t('familyCard.approveMessage', { name }), t('familyCard.approve'))) {
    await act(() => approveRequest(request.id));
  }
};

const decline = (id: string): Promise<void> => act(() => declineRequest(id));

const cancel = (id: string): Promise<void> => act(() => dropInvite(id));

const remove = async (member: FamilyMember): Promise<void> => {
  const name = member.name ?? t('familyCard.noName');
  if (
    await ask(t('familyCard.removeTitle'), t('familyCard.removeMessage', { name }), t('familyCard.removeConfirm'), 'negative')
  ) {
    await act(() => removeMember(member.userId));
  }
};

const leave = async (): Promise<void> => {
  if (!(await ask(t('familyCard.leaveTitle'), t('familyCard.leaveMessage'), t('familyCard.leaveConfirm'), 'negative'))) {
    return;
  }
  busy.value = true;
  await sync.run();
  if (!(await account.leaveFamily())) {
    busy.value = false;
    $q.notify({ type: 'negative', message: t('familyCard.failed') });
    return;
  }
  window.location.replace(import.meta.env.BASE_URL);
};
</script>
