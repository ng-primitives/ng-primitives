/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpRadioGroupDirective } from './radio-group.directive';

export const NgpRadioGroupToken = new InjectionToken<NgpRadioGroupDirective>('NgpRadioGroupToken');

/**
 * Injects the radio group directive.
 * @returns The radio group directive.
 */
export function injectRadioGroup(): NgpRadioGroupDirective {
  return inject(NgpRadioGroupToken);
}
