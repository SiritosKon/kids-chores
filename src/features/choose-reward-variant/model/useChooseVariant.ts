import { useQuasar } from 'quasar';
import { celebrateReward } from '@/shared/lib/confetti';
import { useChildrenStore } from '@/entities/child';
import { useRewardsStore, VariantPickerDialog, type VariantChoice } from '@/entities/reward';
import { chooseSpendVariant, type Spend } from '@/entities/spend';
import { useParentSessionStore } from '@/entities/parent-session';

export const useChooseVariant = () => {
  const $q = useQuasar();
  const rewardsStore = useRewardsStore();
  const childrenStore = useChildrenStore();
  const parentSession = useParentSessionStore();

  const choose = (spend: Pick<Spend, 'id' | 'childId' | 'rewardId'>): Promise<boolean> =>
    new Promise((resolve) => {
      const variants = rewardsStore.variantsOf(spend.rewardId);
      if (variants.length === 0) {
        resolve(false);
        return;
      }
      $q.dialog({
        component: VariantPickerDialog,
        componentProps: {
          rewardName: rewardsStore.nameOf(spend.rewardId),
          variants,
          caption: `${childrenStore.nameOf(spend.childId)} · приз за серию`,
        },
      })
        .onOk(async (choice: VariantChoice) => {
          await chooseSpendVariant(spend.id, { variantId: choice.id, variantName: choice.name });
          $q.notify({ type: 'positive', message: `Выбрано: ${choice.name}` });
          if (!parentSession.active) {
            celebrateReward(childrenStore.byId(spend.childId)?.carColor);
          }
          resolve(true);
        })
        .onCancel(() => resolve(false));
    });

  const chooseInTurn = async (spends: readonly Pick<Spend, 'id' | 'childId' | 'rewardId'>[]): Promise<void> => {
    for (const spend of spends) {
      await choose(spend);
    }
  };

  return { choose, chooseInTurn };
};
