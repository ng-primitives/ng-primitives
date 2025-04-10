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
