/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpButton } from './button';

export const NgpButtonToken = new InjectionToken<NgpButton>('NgpButtonToken');

/**
 * Inject the Button directive instance
 */
export function injectButton(): NgpButton {
  return inject(NgpButtonToken);
}
