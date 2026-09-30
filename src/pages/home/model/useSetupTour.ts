import { computed, nextTick, onBeforeUnmount, watch } from 'vue';
import { useQuasar } from 'quasar';
import { driver, type Driver } from 'driver.js';
import { useRoute, useRouter } from 'vue-router';
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
  const childrenStore = useChildrenStore();
  const tasksStore = useTasksStore();
  const rewardsStore = useRewardsStore();
  const settingsStore = useSettingsStore();
  const parentSession = useParentSessionStore();
  const router = useRouter();
  const route = useRoute();
  const onSettings = (): boolean => route.path === ROUTES.settings;

  let tour: Driver | null = null;
  let moving = false;
  let resumeAt = 0;

  const isTourPath = (path: string): boolean => path === ROUTES.home || path === ROUTES.settings;

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
    if (onSettings()) {
      await router.push(ROUTES.home);
    }
    await settingsStore.update({ tourPending: false });
  };

  const isSkipped = (index: number): boolean =>
    TOUR_STEPS[index]?.needsStreak === true && !settingsStore.streak.enabled;

  const goTo = async (requested: number): Promise<void> => {
    if (!tour || moving) {
      return;
    }
    const direction = requested >= activeIndex() ? 1 : -1;
    let index = requested;
    while (isSkipped(index)) {
      index += direction;
    }
    const target = TOUR_STEPS[index];
    if (!target) {
      await finish();
      return;
    }
    moving = true;
    const wantsSettings = target.inSettings === true;
    if (wantsSettings !== onSettings()) {
      await router.push(wantsSettings ? ROUTES.settings : ROUTES.home);
      await wait(TOUR_DIALOG_DELAY_MS);
    }
    tour?.moveTo(index);
    moving = false;
  };

  const activeIndex = (): number => tour?.getActiveIndex() ?? 0;

  const next = (): void => {
    const step = TOUR_STEPS[activeIndex()];
    if (step && !isMet(step.requirement)) {
      $q.notify({ type: 'warning', message: step.requirementHint ?? '' });
      return;
    }
    void goTo(activeIndex() + 1);
  };

  const previous = (): void => {
    void goTo(activeIndex() - 1);
  };

  const askToSkip = (): void => {
    $q.dialog({
      title: 'Пропустить знакомство?',
      message: 'Детей, задачи и награды можно добавить позже в родительском режиме.',
      cancel: { flat: true, noCaps: true, label: 'Продолжить' },
      ok: { flat: true, noCaps: true, label: 'Пропустить' },
    }).onOk(() => void finish());
  };

  const start = (fromIndex = 0): void => {
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
    () => settingsStore.streak.enabled,
    async (enabled) => {
      const step = TOUR_STEPS[activeIndex()];
      if (tour && enabled && step?.unlocksStreak) {
        await wait(TOUR_DIALOG_DELAY_MS);
        await goTo(activeIndex() + 1);
      }
    }
  );

  watch(
    () => route.path,
    async (path) => {
      if (!shouldRun.value || moving) {
        return;
      }
      if (!isTourPath(path) && tour) {
        resumeAt = activeIndex();
        stop();
      } else if (isTourPath(path) && !tour) {
        await wait(TOUR_DIALOG_DELAY_MS);
        start(resumeAt);
      }
    }
  );

  onBeforeUnmount(stop);
};
