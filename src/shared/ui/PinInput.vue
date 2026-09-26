<template>
  <div class="pin-input">
    <div class="pin-input__dots" :class="{ 'pin-input__dots--error': error }" aria-hidden="true">
      <span
        v-for="index in length"
        :key="index"
        class="pin-input__dot"
        :class="{ 'pin-input__dot--filled': index <= modelValue.length }"
      />
    </div>
    <div class="pin-input__keypad">
      <button v-for="digit in PIN_KEYPAD_DIGITS" :key="digit" type="button" class="pin-input__key" @click="press(digit)">
        {{ digit }}
      </button>
      <span />
      <button type="button" class="pin-input__key" @click="press('0')">0</button>
      <button type="button" class="pin-input__key pin-input__key--flat" aria-label="Стереть" @click="erase">
        <q-icon name="backspace" size="24px" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { PIN_KEYPAD_DIGITS } from './constants';

const props = withDefaults(defineProps<{ modelValue: string; length: number; error?: boolean }>(), {
  error: false,
});
const emit = defineEmits<{ 'update:modelValue': [value: string]; complete: [value: string] }>();

const press = (digit: string): void => {
  if (props.modelValue.length >= props.length) {
    return;
  }
  const next = props.modelValue + digit;
  emit('update:modelValue', next);
  if (next.length === props.length) {
    emit('complete', next);
  }
};

const erase = (): void => {
  emit('update:modelValue', props.modelValue.slice(0, -1));
};

const onKey = (event: KeyboardEvent): void => {
  if (/^\d$/.test(event.key)) {
    press(event.key);
  } else if (event.key === 'Backspace') {
    erase();
  }
};

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
.pin-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.pin-input__dots {
  display: flex;
  gap: 14px;
}

.pin-input__dots--error {
  animation: pin-shake 0.35s ease;
}

.pin-input__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #8e8e93;
}

.pin-input__dot--filled {
  background: #ff9f0a;
  border-color: #ff9f0a;
}

.pin-input__keypad {
  display: grid;
  grid-template-columns: repeat(3, 72px);
  gap: 14px;
}

.pin-input__key {
  height: 72px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 28px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.pin-input__key:active {
  background: rgba(255, 255, 255, 0.25);
}

.pin-input__key--flat {
  background: transparent;
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
