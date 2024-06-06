/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSelect } from './select.directive';

export const NgpSelectToken = new InjectionToken<NgpSelect<unknown>>('NgpSelectToken');

/**
 * Inject the Select directive instance
 */
export function injectSelect<T>(): NgpSelect<T> {
  return inject<NgpSelect<T>>(NgpSelectToken);
}
