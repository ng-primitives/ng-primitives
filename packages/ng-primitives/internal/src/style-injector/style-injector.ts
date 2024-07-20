/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * A utility service for injecting styles into the document.
 * Angular doesn't allow directives to specify styles, only components.
 * As we ship directives, occasionally we need to associate styles with them.
 * This service allows us to programmatically inject styles into the document.
 */
@Injectable({
  providedIn: 'root',
})
export class StyleInjector {
  /**
   * Detect the platform.
   */
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Store the map of style elements with their unique identifiers.
   */
  private readonly styleElements = new Map<string, HTMLStyleElement>();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.collectServerStyles();
    }
  }

  /**
   * Inject a style into the document.
   * @param id The unique identifier for the style.
   * @param style The style to inject.
   */
  add(id: string, style: string): void {
    if (this.styleElements.has(id)) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-ngp-style', id);
    styleElement.textContent = style;

    document.head.appendChild(styleElement);
    this.styleElements.set(id, styleElement);
  }

  /**
   * Remove a style from the document.
   * @param id The unique identifier for the style.
   */
  remove(id: string): void {
    const styleElement = this.styleElements.get(id);

    if (styleElement) {
      document.head.removeChild(styleElement);
      this.styleElements.delete(id);
    }
  }

  /**
   * Collect any styles that were rendered by the server.
   */
  private collectServerStyles(): void {
    const styleElements = document.querySelectorAll<HTMLStyleElement>('style[data-ngp-style]');

    styleElements.forEach(styleElement => {
      const id = styleElement.getAttribute('data-ngp-style');

      if (id) {
        this.styleElements.set(id, styleElement);
      }
    });
  }
}

export function injectStyleInjector(): StyleInjector {
  return inject(StyleInjector);
}
