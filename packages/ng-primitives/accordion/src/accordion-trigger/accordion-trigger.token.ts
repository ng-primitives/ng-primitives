/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionTriggerDirective } from './accordion-trigger.directive';

export const NgpAccordionTriggerToken = new InjectionToken<NgpAccordionTriggerDirective>(
  'NgpAccordionTriggerToken',
);

/**
 * Inject the AccordionTrigger directive instance
 * @returns The AccordionTrigger directive instance
 */
export function injectAccordionTrigger(): NgpAccordionTriggerDirective {
  return inject(NgpAccordionTriggerToken);
}
