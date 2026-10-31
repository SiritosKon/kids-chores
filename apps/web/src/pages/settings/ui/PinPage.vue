<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('settingsPage.pinTitle')" :back-to="ROUTES.settings" />
    <section class="ios-card q-pa-md">
      <PinChangeForm @done="goBack(ROUTES.settings)" />
    </section>
    <section class="ios-card q-pa-md q-mt-md">
      <div class="text-subtitle1 q-mb-xs">{{ t('settingsPage.questionTitle') }}</div>
      <div class="text-caption text-grey-5 q-mb-md">
        {{ currentQuestion ? t('settingsPage.questionSet') : t('settingsPage.questionMissing') }}
      </div>
      <PinQuestionForm
        :key="currentQuestion ?? ''"
        :submit-label="t('common.save')"
        :initial-question="currentQuestion ?? ''"
        :busy="saving"
        @save="saveQuestion"
      />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { useSettingsStore, type PinRecovery } from '@/entities/settings';
import { PinChangeForm } from '@/features/edit-settings';
import { PinQuestionForm } from '@/features/pin-question';

const $q = useQuasar();
const { t } = useI18n();
const goBack = useGoBack();
const settingsStore = useSettingsStore();
const saving = ref(false);
const currentQuestion = computed(() => settingsStore.settings?.pinQuestion?.question ?? null);

const saveQuestion = async (recovery: PinRecovery): Promise<void> => {
  saving.value = true;
  try {
    await settingsStore.changeQuestion(recovery);
    $q.notify({ type: 'positive', message: t('settingsPage.questionSaved') });
  } finally {
    saving.value = false;
  }
};
</script>
