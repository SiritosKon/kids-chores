import type { PresetChild, PresetReward, PresetTask } from './types';

export const PRESET_CHILD: PresetChild = {
  nameKey: 'starterPresets.child',
  carColor: '#0A84FF',
  figure: 'truck',
};

export const PRESET_TASKS: readonly PresetTask[] = [
  { nameKey: 'starterPresets.tasks.teeth', icon: 'wash', color: '#0A84FF', points: 2 },
  { nameKey: 'starterPresets.tasks.bed', icon: 'bed', color: '#FF9F0A', points: 2 },
  { nameKey: 'starterPresets.tasks.toys', icon: 'toys', color: '#30D158', points: 3 },
];

export const PRESET_REWARDS: readonly PresetReward[] = [
  { nameKey: 'starterPresets.rewards.cartoons', icon: 'smart_display', points: 10, visibility: 'shop' },
  { nameKey: 'starterPresets.rewards.iceCream', icon: 'icecream', points: 15, visibility: 'shop' },
  { nameKey: 'starterPresets.rewards.toy', icon: 'card_giftcard', points: 60, visibility: 'shop' },
];
