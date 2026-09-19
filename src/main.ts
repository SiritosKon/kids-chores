import { createApp } from 'vue';
import { App, installProviders } from '@/app';

const app = createApp(App);
installProviders(app);
app.mount('#app');
