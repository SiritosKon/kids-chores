import type { InstallSlide } from './types';

export const INSTALL_SLIDES: readonly InstallSlide[] = [
  {
    icon: 'ios_share',
    title: 'installApp.shareTitle',
    text: 'installApp.shareText',
  },
  {
    icon: 'add_box',
    title: 'installApp.addTitle',
    text: 'installApp.addText',
  },
  {
    icon: 'check_circle',
    title: 'installApp.confirmTitle',
    text: 'installApp.confirmText',
  },
  {
    icon: 'sync_alt',
    title: 'installApp.moveTitle',
    text: 'installApp.moveText',
    warning: true,
  },
];
