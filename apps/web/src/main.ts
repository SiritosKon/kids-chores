import { createApp } from 'vue';
import { App, installProviders } from '@/app';
import { bootstrap } from '@/app/model/bootstrap';

const app = createApp(App);
installProviders(app);
app.mount('#app');

bootstrap().catch(() => undefined);
