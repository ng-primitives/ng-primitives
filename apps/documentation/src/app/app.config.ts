import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { provideFileRouter } from '@analogjs/router';
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(),
    provideContent(withMarkdownRenderer()),
    provideExperimentalZonelessChangeDetection(),
  ],
};
