import { createApp } from 'vue';
import { Quasar, Notify, Dialog, BottomSheet } from 'quasar';
import langRu from 'quasar/lang/ru';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

import App from './App.vue';

const app = createApp(App);
app.use(Quasar, { plugins: { Notify, Dialog, BottomSheet }, config: { dark: true }, lang: langRu });
app.mount('#app');
