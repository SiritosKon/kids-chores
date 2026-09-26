import type { TourStep } from './types';

export const TOUR_STEPS: readonly TourStep[] = [
  {
    element: '[data-tour="add-child"]',
    title: 'Дети',
    description: 'Нажмите, чтобы добавить ребёнка: имя, цвет машинки и фото. Добавьте всех, кто будет отмечать дела.',
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
    element: '[data-tour="rewards"]',
    title: 'Награды',
    description: 'Раскройте список и добавьте, на что дети тратят баллы. Можно сделать и позже.',
    side: 'top',
  },
  {
    element: '[data-tour="parent-menu"]',
    title: 'Меню',
    description: 'В «Настройках» — серия за дни подряд, бонус за все задачи дня и смена PIN. Здесь же экспорт данных.',
    side: 'bottom',
  },
  {
    element: '[data-tour="parent-badge"]',
    title: 'Родительский режим',
    description: 'Пока горит эта метка, можно всё менять. Выйти — через меню, тогда дети увидят только свои дела.',
    side: 'bottom',
  },
];
