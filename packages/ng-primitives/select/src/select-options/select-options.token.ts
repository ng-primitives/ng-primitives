/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSelectOptions } from './select-options.directive';

export const NgpSelectOptionsToken = new InjectionToken<NgpSelectOptions<unknown>>(
  'NgpSelectOptionsToken',
);

/**
 * Inject the SelectOptions directive instance
 */
export function injectSelectOptions<T>(): NgpSelectOptions<T> {
  return inject(NgpSelectOptionsToken) as NgpSelectOptions<T>;
}
