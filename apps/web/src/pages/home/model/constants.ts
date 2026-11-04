import type { TourStep } from './types';

export const TOUR_DIALOG_DELAY_MS = 400;

export const TOUR_STEPS: readonly TourStep[] = [
  {
    element: '[data-tour="add-child"]',
    titleKey: 'homePage.tour.childrenTitle',
    descriptionKey: 'homePage.tour.childrenText',
    side: 'bottom',
    requirement: 'child',
    requirementHintKey: 'homePage.tour.childrenHint',
  },
  {
    element: '[data-tour="add-task"]',
    titleKey: 'homePage.tour.tasksTitle',
    descriptionKey: 'homePage.tour.tasksText',
    side: 'top',
    requirement: 'task',
    requirementHintKey: 'homePage.tour.tasksHint',
  },
  {
    element: '[data-tour="add-reward"]',
    titleKey: 'homePage.tour.rewardsTitle',
    descriptionKey: 'homePage.tour.rewardsText',
    side: 'bottom',
  },
  {
    element: '[data-tour="parent-menu"]',
    titleKey: 'homePage.tour.menuTitle',
    descriptionKey: 'homePage.tour.menuText',
    side: 'bottom',
  },
];
