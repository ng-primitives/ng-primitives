import { provideFileRouter, withDebugRoutes } from '@analogjs/router';
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideExperimentalZonelessChangeDetection(), provideFileRouter(withDebugRoutes())],
};
