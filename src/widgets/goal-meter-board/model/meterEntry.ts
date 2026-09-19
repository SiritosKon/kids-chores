/** Вью-модель полосы прогресса: ребёнок + его баланс в долях до планки копилки. */
export interface MeterEntry {
  childId: string;
  name: string;
  photo: string;
  carColor: string;
  balance: number;
  ratio: number;
}
