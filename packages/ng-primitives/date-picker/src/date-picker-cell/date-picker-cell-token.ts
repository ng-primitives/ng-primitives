import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerCell } from './date-picker-cell';

export const NgpDatePickerCellToken = new InjectionToken<NgpDatePickerCell>(
  'NgpDatePickerCellToken',
);

/**
 * Inject the DatePickerCell directive instance
 */
export function injectDatePickerCell(): NgpDatePickerCell {
  return inject(NgpDatePickerCellToken);
}
