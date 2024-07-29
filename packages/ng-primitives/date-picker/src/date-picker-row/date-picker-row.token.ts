/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerRow } from './date-picker-row.directive';

export const NgpDatePickerRowToken = new InjectionToken<NgpDatePickerRow<unknown>>(
  'NgpDatePickerRowToken',
);

/**
 * Inject the DatePickerRow directive instance
 */
export function injectDatePickerRow<T>(): NgpDatePickerRow<T> {
  return inject(NgpDatePickerRowToken) as NgpDatePickerRow<T>;
}

export const NgpDatePickerWeekToken = new InjectionToken<unknown[]>('NgpDatePickerWeekToken');

/**
 * Inject current week days
 */
export function injectDatePickerWeek<T>(): T[] {
  return inject(NgpDatePickerWeekToken) as T[];
}
