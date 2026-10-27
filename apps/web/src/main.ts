import { createApp } from 'vue';
import { App, installProviders } from '@/app';
import { bootstrap } from '@/app/model/bootstrap';
import { keepViewportInPlace } from '@/app/model/viewport';

const app = createApp(App);
installProviders(app);
app.mount('#app');
keepViewportInPlace();

bootstrap().catch(() => undefined);
