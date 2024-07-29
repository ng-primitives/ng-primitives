/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePicker } from './date-picker.directive';

export const NgpDatePickerToken = new InjectionToken<NgpDatePicker<unknown>>('NgpDatePickerToken');

/**
 * Inject the DatePicker directive instance
 */
export function injectDatePicker<T>(): NgpDatePicker<T> {
  return inject(NgpDatePickerToken) as NgpDatePicker<T>;
}
