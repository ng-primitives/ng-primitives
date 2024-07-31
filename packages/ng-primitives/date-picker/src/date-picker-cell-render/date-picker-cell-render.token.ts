/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerCellRender } from './date-picker-cell-render.directive';

export const NgpDatePickerCellRenderToken = new InjectionToken<NgpDatePickerCellRender<unknown>>(
  'NgpDatePickerCellRenderToken',
);

/**
 * Inject the DatePickerCell directive instance
 */
export function injectDatePickerCellRender<T>(): NgpDatePickerCellRender<T> {
  return inject(NgpDatePickerCellRenderToken) as NgpDatePickerCellRender<T>;
}

export const NgpDatePickerCellDateToken = new InjectionToken<unknown>('NgpDatePickerCellDateToken');

/**
 * Inject current cell date
 */
export function injectDatePickerCellDate<T>(): T {
  return inject(NgpDatePickerCellDateToken) as T;
}
