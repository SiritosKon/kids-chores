import { SCROLL_RESET_DELAY_MS } from './constants';

const isEditing = (): boolean =>
  document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;

const resetScroll = (): void => {
  window.setTimeout(() => {
    if (!isEditing() && (window.scrollX !== 0 || window.scrollY !== 0)) {
      window.scrollTo(0, 0);
    }
  }, SCROLL_RESET_DELAY_MS);
};

export const keepViewportInPlace = (): void => {
  window.addEventListener('focusout', resetScroll);
};
