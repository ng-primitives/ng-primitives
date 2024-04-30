/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpTooltipTriggerDirective } from './tooltip-trigger.directive';

export const NgpTooltipTriggerToken = new InjectionToken<NgpTooltipTriggerDirective>(
  'NgpTooltipTriggerToken',
);

/**
 * Inject the TooltipTrigger directive instance
 */
export function injectTooltipTrigger(): NgpTooltipTriggerDirective {
  return inject(NgpTooltipTriggerToken);
}

/**
 * Provides the TooltipTrigger directive instance
 */
export function provideTooltipTrigger(trigger: NgpTooltipTriggerDirective) {
  return { provide: NgpTooltipTriggerToken, useValue: trigger };
}
