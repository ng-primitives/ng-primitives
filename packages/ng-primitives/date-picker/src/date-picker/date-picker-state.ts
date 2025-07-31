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
  return (
    injectDatePickerState({ optional: true }) ?? injectDateRangePickerState({ optional: true })
  );
}
