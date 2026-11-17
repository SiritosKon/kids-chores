<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @hide="pin = ''">
    <q-card class="dialog--form">
      <q-card-section class="row items-center no-wrap">
        <div class="text-h6 col">{{ t('linkSignIn.confirmTitle') }}</div>
        <q-btn flat round dense icon="close" v-close-popup :aria-label="t('common.close')" />
      </q-card-section>
      <q-card-section class="q-pt-none q-pb-lg">
        <p class="text-grey-5">{{ t('linkSignIn.confirmIntro') }}</p>
        <PinInput v-model="pin" :length="PARENT_PIN_LENGTH" :error="error" @complete="check" />
        <div v-if="busy" class="row justify-center q-mt-sm"><q-spinner color="primary" size="20px" /></div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { confirmPin } from '@/entities/account';
import { PARENT_PIN_LENGTH } from '@/entities/settings';
import { CONFIRM_ERRORS } from '../model/constants';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean]; confirmed: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const pin = ref('');
const error = ref(false);
const busy = ref(false);

const check = async (value: string): Promise<void> => {
  if (busy.value) {
    return;
  }
  error.value = false;
  busy.value = true;
  const result = await confirmPin(value);
  busy.value = false;
  if (result === 'ok') {
    emit('update:modelValue', false);
    emit('confirmed');
    return;
  }
  pin.value = '';
  error.value = result === 'wrong';
  $q.notify({ type: 'negative', message: t(CONFIRM_ERRORS[result]) });
};
</script>
