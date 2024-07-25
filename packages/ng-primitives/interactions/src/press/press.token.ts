/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpPress } from './press.directive';

export const NgpPressToken = new InjectionToken<NgpPress>('NgpPressToken');

/**
 * Inject the Press directive instance
 */
export function injectPress(): NgpPress {
  return inject(NgpPressToken);
}
