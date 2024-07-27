/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerPreviousMonth } from './date-picker-previous-month.directive';

export const NgpDatePickerPreviousMonthToken = new InjectionToken<NgpDatePickerPreviousMonth>(
  'NgpDatePickerPreviousMonthToken',
);

/**
 * Inject the DatePickerPreviousMonth directive instance
 */
export function injectDatePickerPreviousMonth(): NgpDatePickerPreviousMonth {
  return inject(NgpDatePickerPreviousMonthToken);
}
