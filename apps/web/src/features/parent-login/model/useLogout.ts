import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useParentSessionStore } from '@/entities/parent-session';

export const useLogout = (): (() => void) => {
  const $q = useQuasar();
  const { t } = useI18n();
  const parentSession = useParentSessionStore();

  return () => {
    $q.dialog({
      title: t('parentLogin.logoutTitle'),
      message: t('parentLogin.logoutMessage'),
      cancel: { flat: true, noCaps: true, label: t('common.cancel') },
      ok: { flat: true, noCaps: true, color: 'primary', label: t('parentLogin.logoutOk') },
      persistent: true,
    }).onOk(() => parentSession.logout());
  };
};
