export type MarksByChild = Record<string, Set<string>>;

export type QuestDoneDays = Record<string, Record<string, string>>;

export type QuestState = 'none' | 'open' | 'done';
