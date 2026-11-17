<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @hide="reset">
    <q-card class="dialog--form">
      <q-card-section class="row items-center no-wrap">
        <div class="text-h6 col">{{ sent ? t('joinFamily.sentTitle') : t('joinFamily.title') }}</div>
        <q-btn flat round dense icon="close" v-close-popup :aria-label="t('common.close')" />
      </q-card-section>

      <q-card-section v-if="sent" class="q-pt-none">
        <p>{{ t('joinFamily.sent', { app: APP_NAME }) }}</p>
        <div class="row justify-end">
          <q-btn unelevated no-caps color="primary" :label="t('joinFamily.done')" v-close-popup />
        </div>
      </q-card-section>

      <q-card-section v-else class="q-pt-none">
        <p class="text-grey-5">{{ t('joinFamily.intro') }}</p>
        <ContactInput v-model="draft" :kinds="account.contactKinds" :error="invalid" @submit="send" />
        <p v-if="!fresh" class="text-caption text-grey-5 q-mt-md q-mb-none">
          {{ alone ? t('joinFamily.replaceAlone') : t('joinFamily.replaceShared') }}
        </p>
        <div class="row justify-end q-mt-md">
          <q-btn unelevated no-caps color="primary" :label="t('joinFamily.send')" :loading="busy" :disable="!draft.value.trim()" @click="send" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { contactSchema } from '@kids-chores/contracts';
import { APP_NAME } from '@/shared/config/constants';
import ContactInput from '@/shared/ui/ContactInput.vue';
import type { ContactDraft } from '@/shared/ui/types';
import { requestToJoin, useAccountStore } from '@/entities/account';

const props = withDefaults(defineProps<{ modelValue?: boolean; fresh?: boolean }>(), { modelValue: false, fresh: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean]; sent: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();
const alone = computed(() => (account.me?.members ?? 1) < 2);

const blank = (): ContactDraft => ({ kind: account.contactKinds[0] ?? 'email', value: '' });
const draft = ref<ContactDraft>(blank());
const invalid = ref(false);
const busy = ref(false);
const sent = ref(false);

const reset = (): void => {
  draft.value = blank();
  invalid.value = false;
  sent.value = false;
};

const send = async (): Promise<void> => {
  const contact = contactSchema.safeParse(draft.value);
  invalid.value = !contact.success;
  if (!contact.success || busy.value || !props.modelValue) {
    return;
  }
  busy.value = true;
  const result = await requestToJoin(contact.data);
  busy.value = false;
  if (result === 'sent') {
    sent.value = true;
    emit('sent');
    return;
  }
  $q.notify({ type: 'negative', message: result === 'tooMany' ? t('joinFamily.tooMany') : t('joinFamily.failed') });
};
</script>
