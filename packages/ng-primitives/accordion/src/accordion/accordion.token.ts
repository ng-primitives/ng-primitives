/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Type } from '@angular/core';
import { ngpInject, provideNgpToken } from 'ng-primitives/internal';
import type { NgpAccordion } from './accordion.directive';

export const NgpAccordionToken = new InjectionToken<NgpAccordion<unknown>>('NgpAccordionToken');

/**
 * Inject the Accordion directive instance
 * @returns The Accordion directive instance
 */
export function injectAccordion<T>(): NgpAccordion<T> {
  return ngpInject(NgpAccordionToken) as NgpAccordion<T>;
}

export function provideAccordion<T>(accordion: Type<NgpAccordion<T>>) {
  return provideNgpToken(NgpAccordionToken, accordion);
}
