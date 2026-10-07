export { rewardSchema, rewardVisibilitySchema, rewardVariantSchema, variantPhotoSchema } from './model/schema';
export type { Reward, RewardVisibility, RewardVariant, VariantPhoto } from './model/types';
export { useRewardsStore } from './model/store';
export { rewardsCatalogue, createReward, updateReward, archiveReward } from './api/rewardsRepo';
export type { RewardDraft, VariantDraft, VariantChoice } from './api/types';
export {
  variantsCatalogue,
  variantPhotosTable,
  getVariantPhotos,
  getAllVariantPhotos,
  saveVariants,
} from './api/variantsRepo';
export { rewardTierColor, rewardColor } from './lib/tier';
export { minRewardPrice, rewardPriceLabel, canBeGoal } from './lib/visibility';
export { REWARD_VISIBILITY_LABELS, GOAL_VISIBILITIES, PRIZE_VISIBILITIES } from './lib/constants';
export { default as VariantPickerDialog } from './ui/VariantPickerDialog.vue';
export { default as RewardSelect } from './ui/RewardSelect.vue';
