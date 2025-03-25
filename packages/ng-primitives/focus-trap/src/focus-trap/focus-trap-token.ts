/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpFocusTrap } from './focus-trap';

export const NgpFocusTrapToken = new InjectionToken<NgpFocusTrap>('NgpFocusTrapToken');

/**
 * Inject the FocusTrap directive instance
 */
export function injectFocusTrap(): NgpFocusTrap {
  return inject(NgpFocusTrapToken);
}
