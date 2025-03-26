/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionTrigger } from './accordion-trigger';

export const NgpAccordionTriggerToken = new InjectionToken<NgpAccordionTrigger<unknown>>(
  'NgpAccordionTriggerToken',
);

/**
 * Inject the AccordionTrigger directive instance
 * @returns The AccordionTrigger directive instance
 */
export function injectAccordionTrigger<T>(): NgpAccordionTrigger<T> {
  return inject(NgpAccordionTriggerToken) as NgpAccordionTrigger<T>;
}
