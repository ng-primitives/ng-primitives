/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerRowRender } from './date-picker-row-render.directive';

export const NgpDatePickerRowRenderToken = new InjectionToken<NgpDatePickerRowRender<unknown>>(
  'NgpDatePickerRowRenderToken',
);

/**
 * Inject the DatePickerRowRender directive instance
 */
export function injectDatePickerRowRender<T>(): NgpDatePickerRowRender<T> {
  return inject(NgpDatePickerRowRenderToken) as NgpDatePickerRowRender<T>;
}

export const NgpDatePickerWeekToken = new InjectionToken<unknown[]>('NgpDatePickerWeekToken');

/**
 * Inject current week days
 */
export function injectDatePickerWeek<T>(): T[] {
  return inject(NgpDatePickerWeekToken) as T[];
}
