import { useQuasar } from 'quasar';
import { celebrate } from '@/shared/lib/confetti';
import type { Child } from '@/entities/child';
import { useRewardsStore, VariantPickerDialog, type Reward, type VariantChoice } from '@/entities/reward';
import { addSpend } from '@/entities/spend';
import { useParentSessionStore } from '@/entities/parent-session';

export const useAwardReward = () => {
  const $q = useQuasar();
  const parentSession = useParentSessionStore();
  const rewardsStore = useRewardsStore();

  const confirm = (child: Child, reward: Reward, choice: VariantChoice | null): void => {
    const title = choice ? `${reward.name} → ${choice.name}` : reward.name;
    $q.dialog({
      title: 'Наградить',
      message: `Выдать «${title}» для ${child.name} за ${reward.points} б.?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      await addSpend(
        child.id,
        reward.id,
        reward.points,
        choice ? { variantId: choice.id, variantName: choice.name } : null
      );
      $q.notify({ type: 'positive', message: `${child.name}: выдано «${title}»` });
      if (!parentSession.active) {
        celebrate(child.carColor);
      }
    });
  };

  const award = (child: Child, reward: Reward): void => {
    const variants = rewardsStore.variantsOf(reward.id);
    if (variants.length === 0) {
      confirm(child, reward, null);
      return;
    }
    $q.dialog({
      component: VariantPickerDialog,
      componentProps: { rewardName: reward.name, variants, caption: child.name },
    }).onOk((choice: VariantChoice) => confirm(child, reward, choice));
  };

  return { award };
};
