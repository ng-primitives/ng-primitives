import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerNextMonth } from './date-picker-next-month';

export const NgpDatePickerNextMonthToken = new InjectionToken<NgpDatePickerNextMonth<unknown>>(
  'NgpDatePickerNextMonthToken',
);

/**
 * Inject the DatePickerNextMonth directive instance
 */
export function injectDatePickerNextMonth<T>(): NgpDatePickerNextMonth<T> {
  return inject(NgpDatePickerNextMonthToken) as NgpDatePickerNextMonth<T>;
}
