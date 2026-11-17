import { watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { PIN_RESET_QUERY } from './constants';

export const usePinResetReturn = (onGranted: () => void): void => {
  const $q = useQuasar();
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();

  watch(
    () => route.query[PIN_RESET_QUERY],
    (outcome) => {
      if (outcome === undefined) {
        return;
      }
      void router.replace({ query: { ...route.query, [PIN_RESET_QUERY]: undefined } });
      if (outcome === 'granted') {
        onGranted();
        return;
      }
      $q.notify({ type: 'negative', message: t('parentLogin.reauthFailed') });
    },
    { immediate: true }
  );
};
