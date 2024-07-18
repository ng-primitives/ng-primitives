/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpFormField } from './form-field.directive';

export const NgpFormFieldToken = new InjectionToken<NgpFormField>('NgpFormFieldToken');

/**
 * Inject the FormField directive instance
 * @param primitive
 */
export function injectFormField(): NgpFormField | null {
  return inject(NgpFormFieldToken, { optional: true });
}
