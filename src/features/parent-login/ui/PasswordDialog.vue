<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    @show="focusInput"
    @hide="reset"
  >
    <q-card style="min-width: 300px; border-radius: 18px">
      <q-card-section>
        <div class="text-h6">Вход в родительский режим</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input
          ref="passwordInput"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Пароль"
          autofocus
          @keyup.enter="submit"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Отмена" v-close-popup />
        <q-btn unelevated color="primary" label="Войти" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar, type QInput } from 'quasar';
import { useParentSessionStore } from '@/entities/parent-session';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const $q = useQuasar();
const parentSession = useParentSessionStore();
const password = ref('');
const showPassword = ref(false);
const passwordInput = ref<QInput | null>(null);

function focusInput(): void {
  passwordInput.value?.focus();
}

function reset(): void {
  password.value = '';
  showPassword.value = false;
}

function submit(): void {
  if (parentSession.login(password.value)) {
    $q.notify({ type: 'positive', message: 'Родительский режим включён' });
    emit('update:modelValue', false);
  } else {
    $q.notify({ type: 'negative', message: 'Неверный пароль' });
  }
}
</script>
