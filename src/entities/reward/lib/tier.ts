export const rewardTierColor = (points: number): string => {
  if (points < 10) {
    return '#30D158';
  }
  if (points < 20) {
    return '#0A84FF';
  }
  return '#FF453A';
};

export const rewardColor = (reward: { points: number; color?: string }): string =>
  reward.color ?? rewardTierColor(reward.points);
