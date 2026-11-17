<template>
  <form class="form-stack" @submit.prevent="save">
    <q-input
      v-if="withCurrent"
      v-model="current"
      outlined
      dark
      :type="visible ? 'text' : 'password'"
      autocomplete="current-password"
      :label="t('passwordForm.currentLabel')"
    />
    <q-input
      v-model="password"
      outlined
      dark
      :autofocus="!withCurrent"
      :type="visible ? 'text' : 'password'"
      autocomplete="new-password"
      :maxlength="PASSWORD_MAX"
      :label="t('passwordForm.newLabel')"
      :hint="t('passwordForm.hint')"
      :error="error !== null"
      :error-message="error ?? ''"
    >
      <template #append>
        <q-btn
          flat
          round
          dense
          :icon="visible ? 'visibility_off' : 'visibility'"
          :aria-label="visible ? t('passwordForm.hide') : t('passwordForm.show')"
          @click="visible = !visible"
        />
      </template>
    </q-input>
    <div class="row">
      <q-btn v-if="cancelLabel" flat no-caps color="grey-5" :label="cancelLabel" @click="emit('cancel')" />
      <q-space />
      <q-btn
        unelevated
        no-caps
        type="submit"
        color="primary"
        class="q-px-md"
        :label="t('passwordForm.save')"
        :loading="busy"
        :disable="password.length < PASSWORD_MIN || (withCurrent && !current)"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PASSWORD_MAX, PASSWORD_MIN } from '@kids-chores/contracts';
import { PASSWORD_ERRORS } from '../lib/constants';
import { useAccountStore } from '../model/store';

const props = withDefaults(defineProps<{ withCurrent?: boolean; cancelLabel?: string }>(), {
  withCurrent: false,
  cancelLabel: '',
});
const emit = defineEmits<{ saved: []; cancel: [] }>();

const { t } = useI18n();
const account = useAccountStore();
const current = ref('');
const password = ref('');
const visible = ref(false);
const busy = ref(false);
const error = ref<string | null>(null);

const save = async (): Promise<void> => {
  if (busy.value || password.value.length < PASSWORD_MIN) {
    return;
  }
  busy.value = true;
  const result = await account.setPassword(password.value, props.withCurrent ? current.value : undefined);
  busy.value = false;
  if (result === 'ok') {
    error.value = null;
    emit('saved');
    return;
  }
  error.value = t(result === 'denied' && props.withCurrent ? 'passwordForm.wrongCurrent' : PASSWORD_ERRORS[result]);
};
</script>
