import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpDatePickerFirstDayOfWeekNumber } from '../date-picker/date-picker-first-day-of-week';

export interface NgpDatePickerConfig {
  /**
   * Define the first day of the week for the date picker calendar.
   * @default 7 (Sunday)
   */
  firstDayOfWeek: NgpDatePickerFirstDayOfWeekNumber;
}

export const defaultDatePickerConfig: NgpDatePickerConfig = {
  firstDayOfWeek: 7,
};

export const NgpDatePickerConfigToken = new InjectionToken<NgpDatePickerConfig>(
  'NgpDatePickerConfigToken',
);

/**
 * Provide the default DatePicker / DateRangePicker configuration
 * @param config The DatePicker / DateRangePicker configuration
 * @returns The provider
 */
export function provideDatePickerConfig(config: Partial<NgpDatePickerConfig>): Provider[] {
  return [
    {
      provide: NgpDatePickerConfigToken,
      useValue: { ...defaultDatePickerConfig, ...config },
    },
  ];
}

/**
 * Inject the DatePicker / DateRangePicker configuration
 * @returns The global DatePicker / DateRangePicker configuration
 */
export function injectDatePickerConfig(): NgpDatePickerConfig {
  return inject(NgpDatePickerConfigToken, { optional: true }) ?? defaultDatePickerConfig;
}
