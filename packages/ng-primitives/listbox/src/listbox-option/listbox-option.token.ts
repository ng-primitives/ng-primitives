/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpListboxOption } from './listbox-option.directive';

export const NgpListboxOptionToken = new InjectionToken<NgpListboxOption<unknown>>(
  'NgpListboxOptionToken',
);

/**
 * Inject the ListboxOption directive instance
 */
export function injectListboxOption<T>(): NgpListboxOption<T> {
  return inject(NgpListboxOptionToken) as NgpListboxOption<T>;
}
