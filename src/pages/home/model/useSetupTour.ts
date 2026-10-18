import { computed, nextTick, onBeforeUnmount, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { driver, type Driver } from 'driver.js';
import { useRoute } from 'vue-router';
import { ROUTES } from '@/shared/config/constants';
import { useChildrenStore } from '@/entities/child';
import { useTasksStore } from '@/entities/task';
import { useRewardsStore } from '@/entities/reward';
import { useSettingsStore } from '@/entities/settings';
import { useParentSessionStore } from '@/entities/parent-session';
import { TOUR_DIALOG_DELAY_MS, TOUR_STEPS } from './constants';
import type { TourRequirement } from './types';

const wait = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

export const useSetupTour = () => {
  const $q = useQuasar();
  const { t } = useI18n();
  const childrenStore = useChildrenStore();
  const tasksStore = useTasksStore();
  const rewardsStore = useRewardsStore();
  const settingsStore = useSettingsStore();
  const parentSession = useParentSessionStore();
  const route = useRoute();

  let tour: Driver | null = null;
  let resumeAt = 0;

  const isMet = (requirement: TourRequirement | undefined): boolean => {
    if (requirement === 'child') {
      return childrenStore.active.length > 0;
    }
    if (requirement === 'task') {
      return tasksStore.active.length > 0;
    }
    return true;
  };

  const refresh = (): void => {
    tour?.refresh();
  };

  const stop = (): void => {
    document.removeEventListener('scroll', refresh, true);
    tour?.destroy();
    tour = null;
  };

  const finish = async (): Promise<void> => {
    stop();
    await settingsStore.update({ tourPending: false });
  };

  const goTo = async (index: number): Promise<void> => {
    if (!tour) {
      return;
    }
    if (index >= TOUR_STEPS.length) {
      await finish();
      return;
    }
    tour.moveTo(Math.max(0, index));
  };

  const activeIndex = (): number => tour?.getActiveIndex() ?? 0;

  const next = (): void => {
    const step = TOUR_STEPS[activeIndex()];
    if (step && !isMet(step.requirement)) {
      $q.notify({ type: 'warning', message: step.requirementHintKey ? t(step.requirementHintKey) : '' });
      return;
    }
    void goTo(activeIndex() + 1);
  };

  const previous = (): void => {
    void goTo(activeIndex() - 1);
  };

  const askToSkip = (): void => {
    $q.dialog({
      title: t('homePage.tour.skipTitle'),
      message: t('homePage.tour.skipText'),
      cancel: { flat: true, noCaps: true, label: t('homePage.tour.continue') },
      ok: { flat: true, noCaps: true, label: t('homePage.tour.skip') },
    }).onOk(() => void finish());
  };

  const start = (fromIndex = 0): void => {
    tour = driver({
      steps: TOUR_STEPS.map((step) => ({
        element: step.element,
        popover: { title: t(step.titleKey), description: t(step.descriptionKey), side: step.side },
      })),
      showProgress: true,
      progressText: t('homePage.tour.progress', { current: '{{current}}', total: '{{total}}' }),
      nextBtnText: t('common.next'),
      prevBtnText: t('common.back'),
      doneBtnText: t('common.done'),
      popoverClass: 'setup-tour',
      smoothScroll: true,
      allowKeyboardControl: false,
      overlayClickBehavior: () => undefined,
      onNextClick: next,
      onPrevClick: previous,
      onDestroyStarted: askToSkip,
    });
    document.addEventListener('scroll', refresh, true);
    tour.drive(fromIndex);
  };

  const shouldRun = computed(
    () => settingsStore.settings?.tourPending === true && parentSession.active
  );

  watch(
    shouldRun,
    async (run) => {
      if (run && !tour) {
        await nextTick();
        start();
      } else if (!run && tour) {
        stop();
      }
    },
    { immediate: true }
  );

  watch(
    () => [childrenStore.active.length, tasksStore.active.length, rewardsStore.active.length],
    async () => {
      await nextTick();
      refresh();
      const step = TOUR_STEPS[activeIndex()];
      if (tour && step?.requirement && isMet(step.requirement)) {
        await wait(TOUR_DIALOG_DELAY_MS);
        await goTo(activeIndex() + 1);
      }
    }
  );


  watch(
    () => route.path,
    async (path) => {
      if (!shouldRun.value) {
        return;
      }
      if (path !== ROUTES.home && tour) {
        resumeAt = activeIndex();
        stop();
      } else if (path === ROUTES.home && !tour) {
        await wait(TOUR_DIALOG_DELAY_MS);
        start(resumeAt);
      }
    }
  );

  onBeforeUnmount(stop);
};
