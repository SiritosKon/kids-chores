import type { PresetChild, PresetReward, PresetTask } from './types';

export const PRESET_CHILD: PresetChild = {
  presetId: 'child',
  nameKey: 'starterPresets.child',
  carColor: '#0A84FF',
  figure: 'truck',
};

export const PRESET_TASKS: readonly PresetTask[] = [
  { presetId: 'task-teeth', nameKey: 'starterPresets.tasks.teeth', icon: 'wash', color: '#0A84FF', points: 2 },
  { presetId: 'task-bed', nameKey: 'starterPresets.tasks.bed', icon: 'bed', color: '#FF9F0A', points: 2 },
  { presetId: 'task-toys', nameKey: 'starterPresets.tasks.toys', icon: 'toys', color: '#30D158', points: 3 },
];

export const PRESET_REWARDS: readonly PresetReward[] = [
  {
    presetId: 'reward-cartoons',
    nameKey: 'starterPresets.rewards.cartoons',
    icon: 'smart_display',
    points: 10,
    visibility: 'shop',
  },
  { presetId: 'reward-ice-cream', nameKey: 'starterPresets.rewards.iceCream', icon: 'icecream', points: 15, visibility: 'shop' },
  { presetId: 'reward-toy', nameKey: 'starterPresets.rewards.toy', icon: 'card_giftcard', points: 60, visibility: 'shop' },
];
