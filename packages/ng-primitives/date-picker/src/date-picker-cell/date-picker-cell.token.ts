/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerCell } from './date-picker-cell.directive';

export const NgpDatePickerCellToken = new InjectionToken<NgpDatePickerCell<unknown>>(
  'NgpDatePickerCellToken',
);

/**
 * Inject the DatePickerCell directive instance
 */
export function injectDatePickerCell<T>(): NgpDatePickerCell<T> {
  return inject(NgpDatePickerCellToken) as NgpDatePickerCell<T>;
}

export const NgpDatePickerCellDateToken = new InjectionToken<unknown>('NgpDatePickerCellDateToken');

/**
 * Inject current cell date
 */
export function injectDatePickerCellDate<T>(): T {
  return inject(NgpDatePickerCellDateToken) as T;
}
