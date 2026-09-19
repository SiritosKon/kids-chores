import { useQuasar } from 'quasar';
import { celebrate } from '@/shared/lib/confetti';
import type { Child } from '@/entities/child';
import type { Reward } from '@/entities/reward';
import { addSpend } from '@/entities/spend';

// Выдача награды: подтверждение, списание баллов и праздник. Панель наград
// только рисует список — сама транзакция живёт здесь.
export function useAwardReward() {
  const $q = useQuasar();

  function award(child: Child, reward: Reward): void {
    $q.dialog({
      title: 'Наградить',
      message: `Выдать «${reward.name}» для ${child.name} за ${reward.points} б.?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      await addSpend(child.id, reward.id, reward.points);
      $q.notify({ type: 'positive', message: `${child.name}: выдано «${reward.name}»` });
      celebrate(child.carColor);
    });
  }

  return { award };
}
