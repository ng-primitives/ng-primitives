import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withShikiHighlighter } from '@analogjs/content/shiki-highlighter';
import { provideFileRouter } from '@analogjs/router';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  Injector,
  PLATFORM_ID,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { Router, Scroll, withInMemoryScrolling } from '@angular/router';
import { filter } from 'rxjs';
import { ApiDocs } from './components/api-docs/api-docs';
import { Example } from './components/example/example';
import { PropDetails } from './components/prop-details/prop-details';
import { Snippet } from './components/snippet/snippet';
import { TabGroup } from './components/tab-group/tab-group';
import { Tab } from './components/tab/tab';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'disabled' }),
    ),
    provideClientHydration(),
    provideContent(
      withMarkdownRenderer(),
      withShikiHighlighter({
        theme: 'github-light',
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      }),
    ),
    provideZonelessChangeDetection(),
    provideAppInitializer(() => {
      const initializerFn = initializeCustomElements(inject(Injector), inject(PLATFORM_ID));
      return initializerFn();
    }),
    provideAppInitializer(() => {
      const scroller = inject(ViewportScroller);
      // Set scroll offset for fixed header (64px header + 16px buffer)
      scroller.setOffset([0, 80]);
    }),
    provideAppInitializer(() => {
      const router = inject(Router);
      const platform = inject(PLATFORM_ID);

      if (isPlatformBrowser(platform)) {
        // Handle scroll-to-top manually since we disabled scrollPositionRestoration.
        // We delay the scroll so it runs after DOM mutations from heading-anchor,
        // source-link, and quick-links which use setTimeout(0) and afterNextRender.
        router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)).subscribe(e => {
          if (e.anchor) {
            // Let anchorScrolling handle fragment navigation
            return;
          }
          setTimeout(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
        });
      }
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

      customElements.define('prop-details', createCustomElement(PropDetails, { injector }));

      customElements.define('tab-group', createCustomElement(TabGroup, { injector }));
      customElements.define('tab-item', createCustomElement(Tab, { injector }));
      customElements.define('api-docs', createCustomElement(ApiDocs, { injector }));
    }
  };
}
