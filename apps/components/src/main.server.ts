import { render } from '@analogjs/router/server';
import '@angular/platform-server/init';
import { App } from './app/app';
import { config } from './app/app.config.server';

export default render(App, config);
