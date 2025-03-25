/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpToast } from './toast';

export const NgpToastToken = new InjectionToken<NgpToast>('NgpToastToken');

/**
 * Inject the Toast directive instance
 */
export function injectToast(): NgpToast {
  return inject(NgpToastToken);
}
