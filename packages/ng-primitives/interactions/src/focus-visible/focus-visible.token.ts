/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpFocusVisible } from './focus-visible.directive';

export const NgpFocusVisibleToken = new InjectionToken<NgpFocusVisible>('NgpFocusVisibleToken');

/**
 * Inject the FocusVisible directive instance
 */
export function injectFocusVisible(): NgpFocusVisible {
  return inject(NgpFocusVisibleToken);
}
