import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { ɵSERVER_CONTEXT as SERVER_CONTEXT } from '@angular/platform-server';
import { provideServerRendering } from '@angular/ssr';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), { provide: SERVER_CONTEXT, useValue: 'ssr-analog' }],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
