export const isIosDevice = (userAgent: string, maxTouchPoints: number): boolean =>
  /iPad|iPhone|iPod/.test(userAgent) || (userAgent.includes('Macintosh') && maxTouchPoints > 1);

export const isRunningStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

export const canAddToHomeScreen = (): boolean =>
  isIosDevice(navigator.userAgent, navigator.maxTouchPoints) && !isRunningStandalone();
