<template>
  <q-input
    ref="field"
    :model-value="modelValue"
    class="pin-input"
    :class="{ 'pin-input--error': error }"
    :input-class="['pin-input__field', { 'pin-input__field--hidden': !visible }]"
    :type="inputType"
    inputmode="numeric"
    pattern="[0-9]*"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    :maxlength="length"
    label="PIN-код"
    autofocus
    @update:model-value="onInput"
  >
    <template #append>
      <q-icon
        :name="visible ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        :aria-label="visible ? 'Скрыть PIN' : 'Показать PIN'"
        @click="visible = !visible"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QInput } from 'quasar';

const props = withDefaults(defineProps<{ modelValue: string; length: number; error?: boolean }>(), {
  error: false,
});
const emit = defineEmits<{ 'update:modelValue': [value: string]; complete: [value: string] }>();

const field = ref<QInput | null>(null);
const visible = ref(false);

const masksText = typeof CSS !== 'undefined' && CSS.supports('-webkit-text-security', 'disc');

const inputType = computed(() => (visible.value || masksText ? 'text' : 'password'));

const onInput = (value: string | number | null): void => {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, props.length);
  emit('update:modelValue', digits);
  if (digits.length === props.length) {
    emit('complete', digits);
  }
};

onMounted(() => field.value?.focus());
</script>

<style scoped>
.pin-input {
  width: 100%;
}

.pin-input--error {
  animation: pin-shake 0.35s ease;
}

:deep(.pin-input__field) {
  letter-spacing: 8px;
  font-size: 22px;
}

:deep(.pin-input__field--hidden) {
  -webkit-text-security: disc;
}

@keyframes pin-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}
</style>
