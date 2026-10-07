export type QuestTerm = 'today' | 'tomorrow' | 'three-days' | 'week' | 'custom';

export interface QuestTermOption {
  value: QuestTerm;
  label: string;
  days?: number;
}
