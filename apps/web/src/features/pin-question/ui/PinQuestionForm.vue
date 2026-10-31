<template>
  <div class="form-stack">
    <q-input
      v-model="question"
      :label="t('pinQuestion.question')"
      :hint="t('pinQuestion.questionHint')"
      :maxlength="PIN_QUESTION_MAX"
    />
    <q-input
      v-model="answer"
      :label="t('pinQuestion.answer')"
      :hint="t('pinQuestion.answerHint')"
      :maxlength="PIN_ANSWER_MAX"
      @keyup.enter="submit"
    />
    <q-btn
      unelevated
      no-caps
      color="primary"
      class="self-end q-px-lg"
      :label="submitLabel"
      :loading="busy"
      :disable="!ready"
      @click="submit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PIN_ANSWER_MAX, PIN_QUESTION_MAX, type PinRecovery } from '@/entities/settings';

const props = withDefaults(defineProps<{ submitLabel: string; initialQuestion?: string; busy?: boolean }>(), {
  initialQuestion: '',
  busy: false,
});
const emit = defineEmits<{ save: [recovery: PinRecovery] }>();

const { t } = useI18n();
const question = ref(props.initialQuestion);
const answer = ref('');
const ready = computed(() => question.value.trim() !== '' && answer.value.trim() !== '');

const submit = (): void => {
  if (ready.value && !props.busy) {
    emit('save', { question: question.value.trim(), answer: answer.value });
  }
};
</script>
