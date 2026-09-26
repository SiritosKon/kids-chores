import { withCatalogueDefaults } from '@/shared/api/catalogue';
import { EARLIEST_DAY_KEY } from '@/shared/lib/date';
import { childrenCatalogue, type Child } from '@/entities/child';
import { tasksCatalogue, type Task } from '@/entities/task';
import { rewardsCatalogue, type Reward } from '@/entities/reward';
import { saveSettings, SETTINGS_ID, type Settings } from '@/entities/settings';

export const FAMILY_CHILDREN = withCatalogueDefaults([
  { id: 'timofey', name: 'Тимофей', carColor: '#42A5F5', weeklyGoal: 28, photo: 'timofey' },
  { id: 'daniil', name: 'Даниил', carColor: '#EF5350', weeklyGoal: 28, photo: 'daniil' },
]) satisfies Child[];

export const FAMILY_TASKS = withCatalogueDefaults(
  [
    { id: 'study', name: 'Учеба', icon: 'school', points: 1, color: '#0A84FF' },
    { id: 'order', name: 'Порядок', icon: 'cleaning_services', points: 1, color: '#30D158' },
    { id: 'reading', name: 'Чтение', icon: 'menu_book', points: 1, color: '#BF5AF2' },
  ].map((task) => ({ ...task, activePeriods: [{ from: EARLIEST_DAY_KEY }] }))
) satisfies Task[];

export const FAMILY_REWARDS = withCatalogueDefaults([
  { id: 'euro-1', name: '1 евро', icon: 'euro', points: 4, purchasable: true, visibility: 'shop' },
  { id: 'youtube-30', name: 'YouTube 30 минут', icon: 'smart_display', points: 10, purchasable: true, visibility: 'shop' },
  {
    id: 'bubble-tea',
    name: 'Бабл Чай',
    icon: 'local_drink',
    points: 30,
    color: '#FF9F0A',
    purchasable: false,
    visibility: 'streak',
  },
] as const) satisfies Reward[];

export const FAMILY_SETTINGS: Settings = {
  id: SETTINGS_ID,
  parentPin: '123456',
  bonus: { enabled: true, points: 1 },
  streak: { enabled: true, milestones: [{ id: 'week', days: 7, rewardId: 'bubble-tea' }] },
};

export const seedFamily = async (): Promise<void> => {
  await childrenCatalogue.putMany(FAMILY_CHILDREN);
  await tasksCatalogue.putMany(FAMILY_TASKS);
  await rewardsCatalogue.putMany(FAMILY_REWARDS.map((reward) => ({ ...reward })));
  await saveSettings(FAMILY_SETTINGS);
};
