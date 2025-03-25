/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerGrid } from './date-picker-grid';

export const NgpDatePickerGridToken = new InjectionToken<NgpDatePickerGrid<unknown>>(
  'NgpDatePickerGridToken',
);

/**
 * Inject the DatePickerGrid directive instance
 */
export function injectDatePickerGrid<T>(): NgpDatePickerGrid<T> {
  return inject(NgpDatePickerGridToken) as NgpDatePickerGrid<T>;
}
