import { createApp } from 'vue';
import { Quasar, Notify, Dialog } from 'quasar';
import langRu from 'quasar/lang/ru';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

import App from './App.vue';

const app = createApp(App);
app.use(Quasar, { plugins: { Notify, Dialog }, config: { dark: true }, lang: langRu });

Notify.setDefaults({
  actions: [{ icon: 'close', color: 'white', round: true, 'aria-label': 'Закрыть' }],
});

app.mount('#app');
