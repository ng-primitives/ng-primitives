import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withPrismHighlighter } from '@analogjs/content/prism-highlighter';
import { provideFileRouter } from '@analogjs/router';
import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationConfig,
  Injector,
  PLATFORM_ID,
  provideZoneChangeDetection,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { withInMemoryScrolling } from '@angular/router';
import { ExampleComponent } from './components/example/example.component';
import { ResponseFieldComponent } from './components/response-field/response-field.component';
import { TabGroupComponent } from './components/tab-group/tab-group.component';
import { TabComponent } from './components/tab/tab.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    provideClientHydration(),
    provideContent(withMarkdownRenderer(), withPrismHighlighter()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => {
      const initializerFn = initializeCustomElements(inject(Injector), inject(PLATFORM_ID));
      return initializerFn();
    }),
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

      customElements.define('tab-group', createCustomElement(TabGroupComponent, { injector }));
      customElements.define('tab-item', createCustomElement(TabComponent, { injector }));
    }
  };
}
