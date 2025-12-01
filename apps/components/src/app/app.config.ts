import { provideFileRouter, withDebugRoutes } from '@analogjs/router';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideFileRouter(withDebugRoutes())],
};
