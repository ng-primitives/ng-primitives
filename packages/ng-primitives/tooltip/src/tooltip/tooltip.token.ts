/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpTooltipDirective } from './tooltip.directive';

export const NgpTooltipToken = new InjectionToken<NgpTooltipDirective>('NgpTooltipToken');

/**
 * Inject the Tooltip directive instance
 */
export function injectTooltip(): NgpTooltipDirective {
  return inject(NgpTooltipToken);
}
