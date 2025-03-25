/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpFocus } from './focus';

export const NgpFocusToken = new InjectionToken<NgpFocus>('NgpFocusToken');

/**
 * Inject the Focus directive instance
 */
export function injectFocus(): NgpFocus {
  return inject(NgpFocusToken);
}
