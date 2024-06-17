/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSelectOption } from './select-option.directive';

export const NgpSelectOptionToken = new InjectionToken<NgpSelectOption<unknown>>(
  'NgpSelectOptionToken',
);

/**
 * Inject the SelectOption directive instance
 */
export function injectSelectOption<T>(): NgpSelectOption<T> {
  return inject<NgpSelectOption<T>>(NgpSelectOptionToken);
}
