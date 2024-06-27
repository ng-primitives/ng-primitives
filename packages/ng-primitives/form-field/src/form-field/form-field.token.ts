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
 */
export function injectFormField(primitive: string): NgpFormField {
  const formField = inject(NgpFormFieldToken, { optional: true });

  if (!formField) {
    throw new Error(`The ${primitive} directive must be used within an NgpFormField.`);
  }

  return formField;
}
