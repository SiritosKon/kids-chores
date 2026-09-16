<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @hide="reset">
    <q-card style="min-width: 300px; border-radius: 18px">
      <q-card-section>
        <div class="text-h6">Вход в родительский режим</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input
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

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useParentMode } from '../composables/useParentMode.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const $q = useQuasar();
const { login } = useParentMode();
const password = ref('');
const showPassword = ref(false);

function reset() {
  password.value = '';
  showPassword.value = false;
}

function submit() {
  if (login(password.value)) {
    $q.notify({ type: 'positive', message: 'Родительский режим включён' });
    emit('update:modelValue', false);
  } else {
    $q.notify({ type: 'negative', message: 'Неверный пароль' });
  }
}
</script>
