/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpCollapsibleTriggerDirective } from './collapsible-trigger.directive';

export const NgpCollapsibleTriggerToken = new InjectionToken<NgpCollapsibleTriggerDirective>(
  'NgpCollapsibleTriggerToken',
);

/**
 * Inject the CollapsibleTrigger directive instance
 * @returns The CollapsibleTrigger directive instance
 */
export function injectCollapsibleTrigger(): NgpCollapsibleTriggerDirective {
  return inject(NgpCollapsibleTriggerToken);
}
