/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Type } from '@angular/core';
import { ngpInject, provideNgpToken } from 'ng-primitives/internal';
import type { NgpListbox } from './listbox.directive';

export const NgpListboxToken = new InjectionToken<NgpListbox<unknown>>('NgpListboxToken');

/**
 * Inject the Listbox directive instance
 */
export function injectListbox<T>(): NgpListbox<T> {
  return ngpInject(NgpListboxToken) as NgpListbox<T>;
}

export function provideListbox<T>(listbox: Type<NgpListbox<T>>) {
  return provideNgpToken(NgpListboxToken, listbox);
}
