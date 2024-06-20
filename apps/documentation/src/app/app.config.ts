import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { provideFileRouter } from '@analogjs/router';
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { withHashLocation, withInMemoryScrolling } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(
      withHashLocation(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    provideContent(withMarkdownRenderer()),
    provideExperimentalZonelessChangeDetection(),
  ],
};
