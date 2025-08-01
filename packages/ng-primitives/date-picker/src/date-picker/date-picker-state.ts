import { InjectOptions } from '@angular/core';
import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  InjectedState,
} from 'ng-primitives/state';
import { NgpDateRangePicker } from '../date-range-picker/date-range-picker';
import { injectDateRangePickerState } from '../date-range-picker/date-range-picker-state';
import type { NgpDatePicker } from './date-picker';

export const NgpDatePickerStateToken = createStateToken<NgpDatePicker<unknown>>('DatePicker');
export const provideDatePickerState = createStateProvider(NgpDatePickerStateToken);
export const injectDatePickerState = createStateInjector<NgpDatePicker<unknown>>(
  NgpDatePickerStateToken,
) as <T>(injectOptions?: InjectOptions) => InjectedState<NgpDatePicker<T>>;
export const datePickerState = createState(NgpDatePickerStateToken);

export function injectDateControllerState<T>(): InjectedState<
  NgpDatePicker<T> | NgpDateRangePicker<T>
> {
  const datePickerState = injectDatePickerState<T>({ optional: true });
  const dateRangePickerState = injectDateRangePickerState<T>({ optional: true });

  if (datePickerState()) {
    return datePickerState;
  } else if (dateRangePickerState()) {
    return dateRangePickerState;
  } else {
    throw new Error('No date picker or date range picker state found');
  }
}
