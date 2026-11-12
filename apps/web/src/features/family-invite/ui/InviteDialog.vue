<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @hide="reset">
    <q-card class="dialog--form">
      <q-card-section class="row items-center no-wrap">
        <div class="text-h6 col">{{ invite ? t('familyInvite.sentTitle') : t('familyInvite.title') }}</div>
        <q-btn flat round dense icon="close" v-close-popup :aria-label="t('common.close')" />
      </q-card-section>

      <q-card-section v-if="invite" class="q-pt-none">
        <p>{{ t('familyInvite.sent', { hint: invite.hint }) }}</p>
        <p class="text-grey-5">
          {{ invite.kind === 'email' ? t('familyInvite.howEmail', { app: APP_NAME }) : t('familyInvite.howPhone', { app: APP_NAME }) }}
        </p>
        <div class="row q-gutter-sm justify-end">
          <q-btn outline no-caps color="primary" :icon="canShare ? 'ios_share' : 'content_copy'" :label="canShare ? t('familyInvite.share') : t('familyInvite.copy')" @click="share" />
          <q-btn unelevated no-caps color="primary" :label="t('familyInvite.done')" v-close-popup />
        </div>
      </q-card-section>

      <q-card-section v-else class="q-pt-none">
        <p class="text-grey-5">{{ t('familyInvite.intro', { app: APP_NAME }) }}</p>
        <ContactInput v-model="draft" :kinds="account.contactKinds" :error="invalid" @submit="send" />
        <div class="row justify-end q-mt-md">
          <q-btn unelevated no-caps color="primary" :label="t('familyInvite.send')" :loading="busy" :disable="!draft.value.trim()" @click="send" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { contactSchema, type FamilyInvite } from '@kids-chores/contracts';
import { APP_NAME } from '@/shared/config/constants';
import ContactInput from '@/shared/ui/ContactInput.vue';
import type { ContactDraft } from '@/shared/ui/types';
import { sendInvite, useAccountStore } from '@/entities/account';
import { appLink } from '../lib/appLink';

const props = withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean]; invited: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();
const canShare = typeof navigator.share === 'function';

const blank = (): ContactDraft => ({ kind: account.contactKinds[0] ?? 'email', value: '' });
const draft = ref<ContactDraft>(blank());
const invalid = ref(false);
const busy = ref(false);
const invite = ref<FamilyInvite | null>(null);

const reset = (): void => {
  draft.value = blank();
  invalid.value = false;
  invite.value = null;
};

const send = async (): Promise<void> => {
  const contact = contactSchema.safeParse(draft.value);
  invalid.value = !contact.success;
  if (!contact.success || busy.value || !props.modelValue) {
    return;
  }
  busy.value = true;
  const result = await sendInvite(contact.data);
  busy.value = false;
  if (result.status === 'sent') {
    invite.value = result.invite;
    emit('invited');
  } else {
    $q.notify({ type: 'negative', message: result.status === 'member' ? t('familyInvite.member') : t('familyCard.failed') });
  }
};

const share = async (): Promise<void> => {
  const url = appLink();
  if (canShare) {
    await navigator.share({ title: APP_NAME, text: t('familyInvite.shareText', { app: APP_NAME }), url }).catch(() => undefined);
    return;
  }
  await copyToClipboard(url);
  $q.notify({ type: 'positive', message: t('familyInvite.copied') });
};
</script>
