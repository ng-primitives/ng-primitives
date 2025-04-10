import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerPreviousMonth } from './date-picker-previous-month';

export const NgpDatePickerPreviousMonthToken = new InjectionToken<
  NgpDatePickerPreviousMonth<unknown>
>('NgpDatePickerPreviousMonthToken');

/**
 * Inject the DatePickerPreviousMonth directive instance
 */
export function injectDatePickerPreviousMonth<T>(): NgpDatePickerPreviousMonth<T> {
  return inject(NgpDatePickerPreviousMonthToken) as NgpDatePickerPreviousMonth<T>;
}
