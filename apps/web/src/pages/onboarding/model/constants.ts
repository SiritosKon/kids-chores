import type { PinSetupStep } from './types';

export const PIN_SETUP_TITLE_KEYS: Readonly<Record<PinSetupStep, string>> = {
  choose: 'onboardingPage.choosePin',
  repeat: 'onboardingPage.repeatPin',
};

export const PARENT_MODE_ABILITY_KEYS = [
  'onboardingPage.abilities.edit',
  'onboardingPage.abilities.approve',
  'onboardingPage.abilities.award',
  'onboardingPage.abilities.setup',
] as const;
