export interface DayGroup<Item> {
  day: string;
  items: Item[];
}

export type Burst = (colors: string[]) => void;
