<template>
  <q-card flat bordered class="bg-grey-10">
    <q-card-section class="form-stack">
      <div class="text-subtitle1">{{ t('editProfile.title') }}</div>
      <div class="form-row">
        <AccountAvatar size="64px" />
        <div class="column items-start">
          <q-btn flat dense no-caps color="primary" icon="photo_camera" :label="t('editProfile.uploadPhoto')" @click="pickPhoto" />
          <q-btn
            v-if="account.photo"
            flat
            dense
            no-caps
            color="grey-5"
            icon="delete_outline"
            :label="t('editProfile.removePhoto')"
            @click="changePhoto(null)"
          />
        </div>
      </div>
      <div class="text-caption text-grey-5">{{ t('editProfile.photoNote') }}</div>
      <q-input
        v-model="draft"
        outlined
        dark
        :maxlength="ACCOUNT_NAME_MAX"
        :label="t('editProfile.name')"
        :hint="t('editProfile.nameHint')"
        @keyup.enter="save"
      />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn
        unelevated
        no-caps
        color="primary"
        text-color="black"
        :label="t('common.save')"
        :disable="!changed"
        :loading="busy"
        @click="save"
      />
    </q-card-actions>
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onPhoto" />
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ACCOUNT_NAME_MAX } from '@kids-chores/contracts';
import { resizePhoto } from '@/shared/lib/resizePhoto';
import { AccountAvatar, useAccountStore } from '@/entities/account';
import { PROFILE_PHOTO_SIZE } from '../model/constants';

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();

const draft = ref(account.name ?? '');
const busy = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const changed = computed(() => draft.value.trim() !== (account.name ?? ''));

watch(
  () => account.name,
  (name) => {
    draft.value = name ?? '';
  }
);

const save = async (): Promise<void> => {
  if (!changed.value || busy.value) {
    return;
  }
  busy.value = true;
  try {
    const done = await account.rename(draft.value.trim() || null);
    $q.notify({
      type: done ? 'positive' : 'negative',
      message: done ? t('editProfile.saved') : t('editProfile.saveFailed'),
    });
  } finally {
    busy.value = false;
  }
};

const changePhoto = (photo: string | null): void => {
  if (!account.setPhoto(photo)) {
    $q.notify({ type: 'negative', message: t('editProfile.photoFailed') });
  }
};

const pickPhoto = (): void => {
  fileInput.value?.click();
};

const onPhoto = async (): Promise<void> => {
  const input = fileInput.value;
  const file = input?.files?.[0];
  if (!input || !file) {
    return;
  }
  try {
    changePhoto(await resizePhoto(file, PROFILE_PHOTO_SIZE, 'square'));
  } catch {
    $q.notify({ type: 'negative', message: t('editProfile.photoFailed') });
  } finally {
    input.value = '';
  }
};
</script>
