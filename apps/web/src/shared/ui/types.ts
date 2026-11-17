import type { ContactKind } from '@kids-chores/contracts';

import type { METER_FIGURES } from './constants';

export type MeterFigureKind = (typeof METER_FIGURES)[number];

export interface ContactDraft {
  kind: ContactKind;
  value: string;
}
