import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerRowRender } from './date-picker-row-render';

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
