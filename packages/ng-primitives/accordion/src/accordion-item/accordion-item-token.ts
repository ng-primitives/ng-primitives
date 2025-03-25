/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionItem } from './accordion-item';

export const NgpAccordionItemToken = new InjectionToken<NgpAccordionItem<unknown>>(
  'NgpAccordionItemToken',
);

/**
 * Inject the AccordionItem directive instance
 * @returns The AccordionItem directive instance
 */
export function injectAccordionItem<T>(): NgpAccordionItem<T> {
  return inject(NgpAccordionItemToken) as NgpAccordionItem<T>;
}
