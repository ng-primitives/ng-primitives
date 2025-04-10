import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpDatePicker } from './date-picker';

export const NgpDatePickerToken = new InjectionToken<NgpDatePicker<unknown>>('NgpDatePickerToken');

/**
 * Inject the DatePicker directive instance
 */
export function injectDatePicker<T>(): NgpDatePicker<T> {
  return inject(NgpDatePickerToken) as NgpDatePicker<T>;
}

/**
 * Provide the DatePicker directive instance
 */
export function provideDatePicker<T>(datePicker: Type<NgpDatePicker<T>>): ExistingProvider {
  return { provide: NgpDatePickerToken, useExisting: datePicker };
}
