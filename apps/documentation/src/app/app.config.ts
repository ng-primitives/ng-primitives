import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withPrismHighlighter } from '@analogjs/content/prism-highlighter';
import { provideFileRouter } from '@analogjs/router';
import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  Injector,
  PLATFORM_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { withInMemoryScrolling } from '@angular/router';
import { Example } from './components/example/example';
import { ResponseFieldComponent } from './components/prop-details/prop-details';
import { Snippet } from './components/snippet/snippet';
import { TabGroup } from './components/tab-group/tab-group';
import { Tab } from './components/tab/tab';

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
      customElements.define('docs-example', createCustomElement(Example, { injector }));
      customElements.define('docs-snippet', createCustomElement(Snippet, { injector }));

      customElements.define(
        'prop-details',
        createCustomElement(ResponseFieldComponent, { injector }),
      );

      customElements.define('tab-group', createCustomElement(TabGroup, { injector }));
      customElements.define('tab-item', createCustomElement(Tab, { injector }));
    }
  };
}
