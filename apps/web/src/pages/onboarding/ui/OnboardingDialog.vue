<template>
  <q-dialog :model-value="true" persistent no-esc-dismiss no-backdrop-dismiss>
    <q-card class="dialog--form onboarding">
      <q-card-section class="text-center">
        <div class="onboarding__emoji">🏁</div>
        <div class="text-h6 text-weight-bold">{{ t('onboardingPage.welcome', { app: APP_NAME }) }}</div>
        <p v-if="stage === 'account'" class="q-mt-sm q-mb-none">
          {{ invite.token ? t('onboardingPage.invitedIntro') : t('onboardingPage.accountIntro') }}
        </p>
        <p v-else-if="stage === 'name'" class="q-mt-sm q-mb-none">{{ t('onboardingPage.nameIntro') }}</p>
        <p v-else-if="stage === 'email'" class="q-mt-sm q-mb-none">{{ t('linkSignIn.offerIntro') }}</p>
        <p v-else-if="stage === 'pin'" class="q-mt-sm q-mb-none">{{ t('onboardingPage.intro') }}</p>
        <p v-else-if="stage === 'invite'" class="q-mt-sm q-mb-none">{{ t('onboardingPage.inviteIntro') }}</p>
      </q-card-section>

      <q-card-section v-if="stage === 'loading'" class="row justify-center q-pb-lg">
        <q-spinner color="primary" size="32px" />
      </q-card-section>

      <template v-else-if="stage === 'account'">
        <q-card-section class="q-pt-none">
          <q-banner v-if="signInFailed" rounded dense class="bg-negative text-white q-mb-md">
            {{ t('onboardingPage.signInFailed') }}
          </q-banner>
          <div v-if="account.server" class="text-center"><SignInOptions /></div>
          <div v-else class="text-center">
            <p class="text-grey-5">{{ t('onboardingPage.offline') }}</p>
            <q-btn
              outline
              no-caps
              color="primary"
              icon="refresh"
              class="q-px-lg"
              :label="t('onboardingPage.retry')"
              :loading="retrying"
              @click="retry"
            />
          </div>
        </q-card-section>
      </template>

      <q-card-section v-else-if="stage === 'name'" class="q-pt-none">
        <q-input
          v-model="draftName"
          outlined
          dark
          autofocus
          autocomplete="given-name"
          :maxlength="ACCOUNT_NAME_MAX"
          :label="t('onboardingPage.nameLabel')"
          @keyup.enter="saveName"
        />
        <div class="row justify-end q-mt-md">
          <q-btn
            unelevated
            no-caps
            color="primary"
            class="q-px-lg"
            :label="t('onboardingPage.next')"
            :loading="savingName"
            :disable="!draftName.trim()"
            @click="saveName"
          />
        </div>
      </q-card-section>
      <q-card-section v-else-if="stage === 'email'" class="q-pt-none">
        <EmailLinkForm :cancel-label="t('linkSignIn.later')" @cancel="emailOffered = true" @added="emailOffered = true" />
      </q-card-section>
      <q-card-section v-else-if="stage === 'invite'" class="q-pt-none">
        <PendingInvite @joined="onJoined" />
      </q-card-section>

      <q-card-section v-else-if="stage === 'waiting'" class="text-center">
        <q-spinner color="primary" size="32px" />
        <p class="q-mt-md">{{ t('onboardingPage.waiting') }}</p>
        <q-btn flat no-caps color="grey-5" :label="t('onboardingPage.startAlone')" @click="stopWaiting" />
      </q-card-section>

      <template v-else>
        <q-card-section class="q-pt-none text-grey-5">
          <div>{{ t('onboardingPage.abilitiesTitle') }}</div>
          <ul class="onboarding__abilities">
            <li v-for="key in PARENT_MODE_ABILITY_KEYS" :key="key">{{ t(key) }}</li>
          </ul>
        </q-card-section>

        <q-card-section>
          <div class="text-center text-subtitle1 q-mb-sm">{{ t(PIN_SETUP_TITLE_KEYS[step]) }}</div>
          <PinInput :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="error" @complete="onPin" />
          <div class="text-center text-caption text-grey-6 q-mt-sm">{{ t('shared.pinHint') }}</div>
          <div class="text-center q-mt-sm">
            <q-btn flat dense no-caps color="grey-5" :label="t('onboardingPage.joinExisting')" @click="joinOpen = true" />
          </div>
        </q-card-section>
        <JoinRequestDialog v-model="joinOpen" fresh @sent="startWaiting" />
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { ACCOUNT_NAME_MAX } from '@kids-chores/contracts';
import { APP_NAME } from '@/shared/config/constants';
import { currentLocale } from '@/shared/i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useAccountStore } from '@/entities/account';
import { useParentSessionStore } from '@/entities/parent-session';
import { setupSettings, useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import { JoinRequestDialog, PendingInvite, usePendingInviteStore } from '@/features/join-family';
import { EmailLinkForm } from '@/features/link-sign-in';
import { SignInOptions } from '@/features/sign-in';
import { seedPresets } from '@/features/starter-presets';
import { useSyncStore } from '@/features/sync';
import { PARENT_MODE_ABILITY_KEYS, PIN_SETUP_TITLE_KEYS, WAIT_POLL_MS } from '../model/constants';
import type { OnboardingStage, PinSetupStep } from '../model/types';

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const account = useAccountStore();
const sync = useSyncStore();
const parentSession = useParentSessionStore();
const settingsStore = useSettingsStore();

const familyLoaded = ref(false);
const retrying = ref(false);
const invite = usePendingInviteStore();
const joining = ref(false);
const joinOpen = ref(false);
const waiting = ref(false);
const draftName = ref('');
const emailOffered = ref(false);
const savingName = ref(false);
const adopting = ref(false);
let poll: ReturnType<typeof setInterval> | undefined;

const stage = computed<OnboardingStage>(() => {
  if (!account.signedIn) {
    return account.loaded ? 'account' : 'loading';
  }
  if (!familyLoaded.value || joining.value || adopting.value) {
    return 'loading';
  }
  if (!account.name) {
    return 'name';
  }
  if (!emailOffered.value && account.server?.emailSignIn === true && account.me?.hasEmail === false) {
    return 'email';
  }
  if (waiting.value) {
    return 'waiting';
  }
  return invite.token !== null ? 'invite' : 'pin';
});

const onJoined = async (): Promise<void> => {
  joining.value = true;
  await sync.run();
  joining.value = false;
};

const stopWaiting = (): void => {
  clearInterval(poll);
  waiting.value = false;
};

const startWaiting = (): void => {
  joinOpen.value = false;
  waiting.value = true;
  clearInterval(poll);
  poll = setInterval(() => void account.refresh(), WAIT_POLL_MS);
};

const keepFamilyPin = async (): Promise<void> => {
  const legacy = settingsStore.settings?.pinHash;
  if (!legacy || !account.pinsKnown || (account.me?.members ?? 1) > 1 || adopting.value) {
    return;
  }
  adopting.value = true;
  const kept = (await account.adoptPin(legacy)) === 'ok';
  adopting.value = false;
  if (kept) {
    $q.notify({ type: 'info', message: t('onboardingPage.pinKept') });
  }
};

watch(stage, (current) => {
  if (current === 'pin') {
    void keepFamilyPin();
  }
}, { immediate: true });

const saveName = async (): Promise<void> => {
  if (!draftName.value.trim() || savingName.value) {
    return;
  }
  savingName.value = true;
  const saved = await account.rename(draftName.value);
  savingName.value = false;
  if (!saved) {
    $q.notify({ type: 'negative', message: t('onboardingPage.nameFailed') });
  }
};

const retry = async (): Promise<void> => {
  retrying.value = true;
  await account.refresh();
  retrying.value = false;
};

const retryOnline = (): void => {
  void account.refresh();
};

watch(
  () => account.signedIn,
  async (signedIn) => {
    if (signedIn && !familyLoaded.value) {
      await sync.run();
      familyLoaded.value = true;
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearInterval(poll);
  window.removeEventListener('online', retryOnline);
});
const signInFailed = computed(() => typeof route.query.error === 'string');

const step = ref<PinSetupStep>('choose');
const pin = ref('');
const chosen = ref('');
const error = ref(false);

onMounted(() => {
  window.addEventListener('online', retryOnline);
  void seedPresets();
});

const onPin = async (value: string): Promise<void> => {
  error.value = false;
  if (step.value === 'choose') {
    chosen.value = value;
    step.value = 'repeat';
    pin.value = '';
    return;
  }
  if (value !== chosen.value) {
    requestAnimationFrame(() => {
      step.value = 'choose';
      error.value = true;
      pin.value = '';
    });
    $q.notify({ type: 'negative', message: t('onboardingPage.pinMismatch') });
    return;
  }
  await setupSettings(currentLocale());
  if ((await account.setPin(value)) !== 'ok') {
    $q.notify({ type: 'negative', message: t('onboardingPage.pinFailed') });
    step.value = 'choose';
    pin.value = '';
    return;
  }
  parentSession.unlock();
};
</script>

<style scoped>
.onboarding__abilities {
  margin: 4px 0 0;
  padding-left: 20px;
}

.onboarding__emoji {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 8px;
}
</style>
