import type { Side } from 'driver.js';

export type TourRequirement = 'child' | 'task';

export interface TourStep {
  element: string;
  title: string;
  description: string;
  side: Side;
  requirement?: TourRequirement;
  requirementHint?: string;
}
