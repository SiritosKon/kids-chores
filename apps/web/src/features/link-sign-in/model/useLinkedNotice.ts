import { watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { AUTH_PROVIDERS } from '@kids-chores/contracts';
import { useAccountStore } from '@/entities/account';
import { LINKED_QUERY, PROVIDER_NAMES } from './constants';

export const useLinkedNotice = (): void => {
  const $q = useQuasar();
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const account = useAccountStore();

  watch(
    () => route.query[LINKED_QUERY],
    (outcome) => {
      if (outcome === undefined) {
        return;
      }
      void router.replace({ query: { ...route.query, [LINKED_QUERY]: undefined } });
      const provider = AUTH_PROVIDERS.find((item) => item === outcome);
      if (provider) {
        $q.notify({ type: 'positive', message: t('linkSignIn.providerLinked', { provider: t(PROVIDER_NAMES[provider]) }) });
        void account.refresh();
        return;
      }
      $q.notify({ type: 'negative', message: t(outcome === 'taken' ? 'linkSignIn.taken' : 'linkSignIn.linkFailed') });
    },
    { immediate: true }
  );
};
