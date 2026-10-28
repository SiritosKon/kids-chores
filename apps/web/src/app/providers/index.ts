import type { App } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, Dialog } from 'quasar';
import { i18n, quasarLang } from '@/shared/i18n';
import { router } from '../router';

import '@quasar/extras/material-icons/material-icons.css';
import 'driver.js/dist/driver.css';
import 'quasar/src/css/index.sass';
import '../styles/index.css';

export const installProviders = (app: App): void => {
  app.use(createPinia());
  app.use(router);
  app.use(i18n);
  app.use(Quasar, { plugins: { Notify, Dialog }, config: { dark: true }, lang: quasarLang() });

  Notify.setDefaults({
    actions: [{ icon: 'close', color: 'white', round: true, 'aria-label': i18n.global.t('common.close') }],
  });
};
