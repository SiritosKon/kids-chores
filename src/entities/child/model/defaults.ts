import timofeyPhoto from '@/shared/assets/timofey.png';
import daniilPhoto from '@/shared/assets/daniil.png';
import { childSchema, type Child } from './schema';

// Сид на время фазы 1: дети ещё живут в коде, но уже проходят через схему,
// поэтому переезд в IndexedDB не поменяет ничего, кроме источника строк.
export const CHILDREN: readonly Child[] = childSchema.array().parse([
  { id: 'timofey', name: 'Тимофей', carColor: '#42A5F5', weeklyGoal: 28, photo: timofeyPhoto },
  { id: 'daniil', name: 'Даниил', carColor: '#EF5350', weeklyGoal: 28, photo: daniilPhoto },
]);

export function findChild(childId: string): Child | undefined {
  return CHILDREN.find((child) => child.id === childId);
}

export function childName(childId: string): string {
  return findChild(childId)?.name ?? childId;
}
