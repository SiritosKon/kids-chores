import { useQuasar } from 'quasar';
import { celebrate } from '@/shared/lib/confetti';
import type { Child } from '@/entities/child';
import type { Reward } from '@/entities/reward';
import { addSpend } from '@/entities/spend';
import { useParentSessionStore } from '@/entities/parent-session';

export const useAwardReward = () => {
  const $q = useQuasar();
  const parentSession = useParentSessionStore();

  const award = (child: Child, reward: Reward): void => {
    $q.dialog({
      title: 'Наградить',
      message: `Выдать «${reward.name}» для ${child.name} за ${reward.points} б.?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      await addSpend(child.id, reward.id, reward.points);
      $q.notify({ type: 'positive', message: `${child.name}: выдано «${reward.name}»` });
      if (!parentSession.active) {
        celebrate(child.carColor);
      }
    });
  };

  return { award };
};
