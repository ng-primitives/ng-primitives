/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerNextMonth } from './date-picker-next-month.directive';

export const NgpDatePickerNextMonthToken = new InjectionToken<NgpDatePickerNextMonth<unknown>>(
  'NgpDatePickerNextMonthToken',
);

/**
 * Inject the DatePickerNextMonth directive instance
 */
export function injectDatePickerNextMonth<T>(): NgpDatePickerNextMonth<T> {
  return inject(NgpDatePickerNextMonthToken) as NgpDatePickerNextMonth<T>;
}
