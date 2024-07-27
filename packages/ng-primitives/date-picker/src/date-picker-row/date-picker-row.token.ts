/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerRow } from './date-picker-row.directive';

export const NgpDatePickerRowToken = new InjectionToken<NgpDatePickerRow>('NgpDatePickerRowToken');

/**
 * Inject the DatePickerRow directive instance
 */
export function injectDatePickerRow(): NgpDatePickerRow {
  return inject(NgpDatePickerRowToken);
}

export const NgpDatePickerWeekToken = new InjectionToken<Date[]>('NgpDatePickerWeekToken');

/**
 * Inject current week days
 */
export function injectDatePickerWeek(): Date[] {
  return inject(NgpDatePickerWeekToken);
}
