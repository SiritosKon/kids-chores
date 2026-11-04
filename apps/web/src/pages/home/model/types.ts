import type { Side } from 'driver.js';

export type TourRequirement = 'child' | 'task';

export interface TourStep {
  element: string;
  titleKey: string;
  descriptionKey: string;
  side: Side;
  requirement?: TourRequirement;
  requirementHintKey?: string;
}
