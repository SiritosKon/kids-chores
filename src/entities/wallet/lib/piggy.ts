const PIGGY_STEP = 50;

export const piggyMax = (balance: number): number => {
  if (balance <= PIGGY_STEP) {
    return PIGGY_STEP;
  }
  return Math.ceil(balance / PIGGY_STEP) * PIGGY_STEP;
};
