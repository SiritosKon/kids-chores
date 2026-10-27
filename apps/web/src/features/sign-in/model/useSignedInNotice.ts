import { watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAccountStore } from '@/entities/account';
import { PICTURE_QUERY, SIGNED_IN_QUERY } from './constants';

export const useSignedInNotice = (): void => {
  const $q = useQuasar();
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const account = useAccountStore();

  const adoptPicture = (url: string): void => {
    if (account.me) {
      void account.adoptProviderPhoto(url);
      return;
    }
    watch(
      () => account.me,
      (me) => {
        if (me) {
          void account.adoptProviderPhoto(url);
        }
      },
      { once: true }
    );
  };

  watch(
    () => route.query[SIGNED_IN_QUERY],
    (signedIn) => {
      if (signedIn === undefined) {
        return;
      }
      const picture = route.query[PICTURE_QUERY];
      $q.notify({ type: 'positive', message: t('signIn.signedIn') });
      void router.replace({ query: { ...route.query, [SIGNED_IN_QUERY]: undefined, [PICTURE_QUERY]: undefined } });
      if (typeof picture === 'string') {
        adoptPicture(picture);
      }
    },
    { immediate: true }
  );
};
