import type { TourStep } from './types';

export const TOUR_DIALOG_DELAY_MS = 400;

export const TOUR_OVER_DIALOGS_CLASS = 'setup-tour--over-dialogs';

export const TOUR_STEPS: readonly TourStep[] = [
  {
    element: '[data-tour="add-child"]',
    title: 'Дети',
    description: 'Нажмите, чтобы добавить ребёнка: имя и фото. Остальных детей можно добавить потом так же.',
    side: 'bottom',
    requirement: 'child',
    requirementHint: 'Добавьте хотя бы одного ребёнка',
  },
  {
    element: '[data-tour="add-task"]',
    title: 'Задачи',
    description: 'Добавьте ежедневные дела и сколько баллов за каждое. Дети отмечают их галочками, родитель нажимает «Принять».',
    side: 'top',
    requirement: 'task',
    requirementHint: 'Добавьте хотя бы одну задачу',
  },
  {
    element: '[data-tour="add-reward"]',
    title: 'Награды',
    description: 'Добавьте, на что дети тратят баллы: мультики, сладости, прогулки. Можно сделать и позже.',
    side: 'bottom',
  },
  {
    element: '[data-tour="parent-menu"]',
    title: 'Меню',
    description: 'Здесь настройки, экспорт данных и выход из родительского режима. Сейчас покажем настройки.',
    side: 'bottom',
  },
  {
    element: '[data-tour="settings-streak-toggle"]',
    title: 'Серия',
    description: 'Награда за дни подряд, когда выполнены все задачи. Включите, чтобы настроить, или нажмите «Далее», если пока не нужно.',
    side: 'bottom',
    inSettings: true,
    unlocksStreak: true,
  },
  {
    element: '[data-tour="settings-streak"]',
    title: 'Настройка серии',
    description: 'Сколько дней подряд нужно и что за это дать: награду, баллы или и то и другое. В списке наград можно сразу создать новую.',
    side: 'top',
    inSettings: true,
    needsStreak: true,
  },
  {
    element: '[data-tour="settings-bonus"]',
    title: 'Бонус',
    description: 'Дополнительные баллы за день, в котором отмечены все задачи. Ниже — смена PIN. На «Далее» настройки сохранятся.',
    side: 'top',
    inSettings: true,
  },
  {
    element: '[data-tour="parent-badge"]',
    title: 'Родительский режим',
    description: 'Пока горит эта метка, можно всё менять. Выйти — через меню, тогда дети увидят только свои дела.',
    side: 'bottom',
  },
];
