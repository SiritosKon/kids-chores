import type { App } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, Dialog } from 'quasar';
import langRu from 'quasar/lang/ru';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import '../styles/index.css';

export function installProviders(app: App): void {
  app.use(createPinia());
  app.use(Quasar, { plugins: { Notify, Dialog }, config: { dark: true }, lang: langRu });

  Notify.setDefaults({
    actions: [{ icon: 'close', color: 'white', round: true, 'aria-label': 'Закрыть' }],
  });
}
