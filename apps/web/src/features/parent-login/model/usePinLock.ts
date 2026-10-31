import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { clearPinFailures, pinLockedFor, recordPinFailure } from '../lib/pinLock';

export const usePinLock = () => {
  const { t } = useI18n();
  const lockedMs = ref(0);
  let ticker: ReturnType<typeof setInterval> | undefined;

  const lockedText = computed(() => {
    const seconds = Math.ceil(lockedMs.value / 1000);
    return seconds < 60
      ? t('parentLogin.seconds', { count: seconds })
      : t('parentLogin.minutes', { count: Math.ceil(seconds / 60) });
  });

  const tick = (): void => {
    lockedMs.value = pinLockedFor(Date.now());
    if (lockedMs.value === 0) {
      clearInterval(ticker);
      ticker = undefined;
    }
  };

  const watchLock = (): void => {
    tick();
    if (lockedMs.value > 0 && ticker === undefined) {
      ticker = setInterval(tick, 1000);
    }
  };

  const fail = (): void => {
    recordPinFailure(Date.now());
    watchLock();
  };

  onBeforeUnmount(() => clearInterval(ticker));

  return { lockedMs, lockedText, watchLock, fail, clear: clearPinFailures };
};
