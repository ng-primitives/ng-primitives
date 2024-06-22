import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withPrismHighlighter } from '@analogjs/content/prism-highlighter';
import { provideFileRouter } from '@analogjs/router';
import { isPlatformBrowser } from '@angular/common';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  Injector,
  PLATFORM_ID,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { withInMemoryScrolling } from '@angular/router';
import { ExampleComponent } from './components/example/example.component';
import { ResponseFieldComponent } from './components/response-field/response-field.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    provideClientHydration(),
    provideContent(withMarkdownRenderer(), withPrismHighlighter()),
    provideExperimentalZonelessChangeDetection(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeCustomElements,
      multi: true,
      deps: [Injector, PLATFORM_ID],
    },
  ],
};

export function initializeCustomElements(
  injector: Injector,
  platform: object,
): () => Promise<void> {
  return async () => {
    if (isPlatformBrowser(platform)) {
      const { createCustomElement } = await import('@angular/elements');
      // Register the custom element with the browser.
      customElements.define('docs-example', createCustomElement(ExampleComponent, { injector }));

      customElements.define(
        'response-field',
        createCustomElement(ResponseFieldComponent, { injector }),
      );
    }
  };
}
