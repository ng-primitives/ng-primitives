/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpTooltip } from './tooltip.directive';

export const NgpTooltipToken = new InjectionToken<NgpTooltip>('NgpTooltipToken');

/**
 * Inject the Tooltip directive instance
 */
export function injectTooltip(): NgpTooltip {
  return inject(NgpTooltipToken);
}
