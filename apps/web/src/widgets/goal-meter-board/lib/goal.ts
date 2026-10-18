import { rewardColor, canBeGoal, type Reward, type RewardVariant } from '@/entities/reward';
import type { GoalEntry } from '../model/types';

export const goalEntry = (
  reward: Reward | undefined,
  variant: RewardVariant | undefined,
  balance: number,
  photo: string
): GoalEntry | null => {
  if (!reward || !reward.active || !canBeGoal(reward.visibility) || reward.points <= 0) {
    return null;
  }
  const price = reward.points;
  const saved = Math.max(0, Math.min(balance, price));
  return {
    name: variant ? `${reward.name} → ${variant.name}` : reward.name,
    price,
    saved,
    ratio: saved / price,
    ready: balance >= price,
    icon: reward.icon,
    color: rewardColor(reward),
    photo,
  };
};
