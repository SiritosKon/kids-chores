export interface ParentCheck {
  question: string;
  answer: number;
}

export interface CheckRange {
  min: number;
  max: number;
}

export type ParentCheckMaker = (random: () => number) => ParentCheck;
