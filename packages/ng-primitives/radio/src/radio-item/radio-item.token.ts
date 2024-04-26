/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpRadioItemDirective } from './radio-item.directive';

export const NgpRadioItemToken = new InjectionToken<NgpRadioItemDirective>('NgpRadioItemToken');

/**
 * Inject the RadioItem directive instance
 * @returns The RadioItem directive instance
 */
export function injectRadioItem(): NgpRadioItemDirective {
  return inject(NgpRadioItemToken);
}