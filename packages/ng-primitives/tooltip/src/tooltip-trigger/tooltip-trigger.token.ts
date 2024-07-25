/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpTooltipTrigger } from './tooltip-trigger.directive';

export const NgpTooltipTriggerToken = new InjectionToken<NgpTooltipTrigger>(
  'NgpTooltipTriggerToken',
);

/**
 * Inject the TooltipTrigger directive instance
 */
export function injectTooltipTrigger(): NgpTooltipTrigger {
  return inject(NgpTooltipTriggerToken);
}

/**
 * Provides the TooltipTrigger directive instance
 * @param trigger
 */
export function provideTooltipTrigger(trigger: NgpTooltipTrigger) {
  return { provide: NgpTooltipTriggerToken, useValue: trigger };
}
