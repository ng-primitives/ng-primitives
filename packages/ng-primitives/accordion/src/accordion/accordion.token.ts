/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionDirective } from './accordion.directive';

export const NgpAccordionToken = new InjectionToken<NgpAccordionDirective<unknown>>(
  'NgpAccordionToken',
);

/**
 * Inject the Accordion directive instance
 * @returns The Accordion directive instance
 */
export function injectAccordion<T>(): NgpAccordionDirective<T> {
  return inject(NgpAccordionToken) as NgpAccordionDirective<T>;
}
