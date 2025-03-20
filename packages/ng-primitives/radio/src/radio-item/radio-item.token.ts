/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject, Type, ExistingProvider } from '@angular/core';
import type { Stateless } from 'ng-primitives/state';
import type { NgpRadioItem } from './radio-item.directive';

export const NgpRadioItemToken = new InjectionToken<Stateless<NgpRadioItem>>('NgpRadioItemToken');

/**
 * Inject the RadioItem directive instance
 */
export function injectRadioItem(): Stateless<NgpRadioItem> {
  return inject(NgpRadioItemToken);
}

/**
 * Provide the RadioItem directive instance
 */
export function provideRadioItem(type: Type<NgpRadioItem>): ExistingProvider {
  return { provide: NgpRadioItemToken, useExisting: type };
}
