import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerCellRender } from './date-picker-cell-render';

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
