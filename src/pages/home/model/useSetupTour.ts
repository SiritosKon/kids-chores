import { computed, nextTick, onBeforeUnmount, watch } from 'vue';
import { useQuasar } from 'quasar';
import { driver, type Driver } from 'driver.js';
import { useChildrenStore } from '@/entities/child';
import { useTasksStore } from '@/entities/task';
import { useSettingsStore } from '@/entities/settings';
import { useParentSessionStore } from '@/entities/parent-session';
import { TOUR_STEPS } from './constants';
import type { TourRequirement } from './types';

export const useSetupTour = () => {
  const $q = useQuasar();
  const childrenStore = useChildrenStore();
  const tasksStore = useTasksStore();
  const settingsStore = useSettingsStore();
  const parentSession = useParentSessionStore();

  let tour: Driver | null = null;

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

  const next = (): void => {
    if (!tour) {
      return;
    }
    const step = TOUR_STEPS[tour.getActiveIndex() ?? 0];
    if (step && !isMet(step.requirement)) {
      $q.notify({ type: 'warning', message: step.requirementHint ?? '' });
      return;
    }
    if (tour.isLastStep()) {
      void finish();
    } else {
      tour.moveNext();
    }
  };

  const askToSkip = (): void => {
    $q.dialog({
      title: 'Пропустить знакомство?',
      message: 'Детей, задачи и награды можно добавить позже в родительском режиме.',
      cancel: { flat: true, noCaps: true, label: 'Продолжить' },
      ok: { flat: true, noCaps: true, label: 'Пропустить' },
    }).onOk(() => void finish());
  };

  const start = (): void => {
    tour = driver({
      steps: TOUR_STEPS.map((step) => ({
        element: step.element,
        popover: { title: step.title, description: step.description, side: step.side },
      })),
      showProgress: true,
      progressText: '{{current}} из {{total}}',
      nextBtnText: 'Далее',
      prevBtnText: 'Назад',
      doneBtnText: 'Готово',
      popoverClass: 'setup-tour',
      smoothScroll: true,
      allowKeyboardControl: false,
      overlayClickBehavior: () => undefined,
      onNextClick: next,
      onDestroyStarted: askToSkip,
    });
    document.addEventListener('scroll', refresh, true);
    tour.drive();
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
    () => [childrenStore.active.length, tasksStore.active.length],
    async () => {
      await nextTick();
      refresh();
    }
  );

  onBeforeUnmount(stop);
};
