/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionContent } from './accordion-content';

export const NgpAccordionContentToken = new InjectionToken<NgpAccordionContent>(
  'NgpAccordionContentToken',
);

/**
 * Inject the AccordionContent directive instance
 * @returns The AccordionContent directive instance
 */
export function injectAccordionContent(): NgpAccordionContent {
  return inject(NgpAccordionContentToken);
}
