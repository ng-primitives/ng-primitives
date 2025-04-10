import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerLabel } from './date-picker-label';

export const NgpDatePickerLabelToken = new InjectionToken<NgpDatePickerLabel<unknown>>(
  'NgpDatePickerLabelToken',
);

/**
 * Inject the DatePickerLabel directive instance
 */
export function injectDatePickerLabel<T>(): NgpDatePickerLabel<T> {
  return inject(NgpDatePickerLabelToken) as NgpDatePickerLabel<T>;
}
