import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerDateButton } from './date-picker-date-button';

export const NgpDatePickerDateButtonToken = new InjectionToken<NgpDatePickerDateButton<unknown>>(
  'NgpDatePickerDateButtonToken',
);

/**
 * Inject the DatePickerDateButton directive instance
 */
export function injectDatePickerDateButton<T>(): NgpDatePickerDateButton<T> {
  return inject(NgpDatePickerDateButtonToken) as NgpDatePickerDateButton<T>;
}
