/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionItemDirective } from './accordion-item.directive';

export const NgpAccordionItemToken = new InjectionToken<NgpAccordionItemDirective<unknown>>(
  'NgpAccordionItemToken',
);

/**
 * Inject the AccordionItem directive instance
 * @returns The AccordionItem directive instance
 */
export function injectAccordionItem<T>(): NgpAccordionItemDirective<T> {
  return inject(NgpAccordionItemToken) as NgpAccordionItemDirective<T>;
}
