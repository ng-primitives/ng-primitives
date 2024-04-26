/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken, inject } from '@angular/core';
import type { NgpCheckboxIndicatorDirective } from './checkbox-indicator.directive';

export const NgpCheckboxIndicatorToken = new InjectionToken<NgpCheckboxIndicatorDirective>(
  'NgpCheckboxIndicatorToken',
);

/**
 * Inject the CheckboxIndicator directive instance
 * @returns The CheckboxIndicator directive instance
 */
export function injectCheckboxIndicator(): NgpCheckboxIndicatorDirective {
  return inject(NgpCheckboxIndicatorToken);
}
