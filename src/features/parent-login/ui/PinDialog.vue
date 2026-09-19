<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    @show="focusInput"
    @hide="reset"
  >
    <q-card>
      <q-card-section>
        <div class="text-h6">Вход в родительский режим</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input
          ref="pinInput"
          v-model="pin"
          :type="showPin ? 'text' : 'password'"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="off"
          :maxlength="PARENT_PIN_LENGTH"
          label="PIN-код"
          autofocus
          input-class="pin-field"
          @update:model-value="onInput"
          @keyup.enter="submit"
        >
          <template #append>
            <q-icon
              :name="showPin ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPin = !showPin"
            />
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Отмена" v-close-popup />
        <q-btn unelevated color="primary" label="Войти" :disable="!complete" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar, type QInput } from 'quasar';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore, isValidPin, PARENT_PIN_LENGTH } from '@/entities/settings';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const $q = useQuasar();
const parentSession = useParentSessionStore();
const settingsStore = useSettingsStore();

const pin = ref('');
const showPin = ref(false);
const pinInput = ref<QInput | null>(null);

const complete = computed(() => isValidPin(pin.value));

const focusInput = (): void => {
  pinInput.value?.focus();
};

const reset = (): void => {
  pin.value = '';
  showPin.value = false;
};

const submit = (): void => {
  if (!complete.value) {
    return;
  }
  if (pin.value === settingsStore.settings.parentPin) {
    parentSession.unlock();
    $q.notify({ type: 'positive', message: 'Родительский режим включён' });
    emit('update:modelValue', false);
  } else {
    $q.notify({ type: 'negative', message: 'Неверный PIN-код' });
    pin.value = '';
  }
};

const onInput = (value: string | number | null): void => {
  pin.value = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, PARENT_PIN_LENGTH);
  if (complete.value) {
    submit();
  }
};
</script>

<style scoped>
:deep(.pin-field) {
  letter-spacing: 6px;
  font-size: 20px;
}
</style>
