import { watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAccountStore } from '@/entities/account';

export const useJoinRequestNotice = (): void => {
  const $q = useQuasar();
  const { t } = useI18n();
  const account = useAccountStore();
  let shown = 0;

  watch(
    () => account.me?.joinRequests ?? 0,
    (count) => {
      if (count > shown) {
        $q.notify({ type: 'info', icon: 'group_add', message: t('familyCard.requestsWaiting', { count }), timeout: 8000 });
      }
      shown = count;
    },
    { immediate: true }
  );
};
