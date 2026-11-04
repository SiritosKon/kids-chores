export type QuestTerm = 'today' | 'tomorrow' | 'three-days' | 'week' | 'custom';

export interface QuestTermOption {
  value: QuestTerm;
  labelKey: string;
  days?: number;
}
