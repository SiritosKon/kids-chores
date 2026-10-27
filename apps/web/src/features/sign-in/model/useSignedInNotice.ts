import { watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { SIGNED_IN_QUERY } from './constants';

export const useSignedInNotice = (): void => {
  const $q = useQuasar();
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();

  watch(
    () => route.query[SIGNED_IN_QUERY],
    (signedIn) => {
      if (signedIn === undefined) {
        return;
      }
      $q.notify({ type: 'positive', message: t('signIn.signedIn') });
      void router.replace({ query: { ...route.query, [SIGNED_IN_QUERY]: undefined } });
    },
    { immediate: true }
  );
};
