import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  InjectedState,
} from 'ng-primitives/state';
import type { NgpDateRangePicker } from '../date-range-picker/date-range-picker';
import type { NgpDatePicker } from './date-picker';

export const NgpDatePickerStateToken = createStateToken<
  NgpDatePicker<unknown> | NgpDateRangePicker<unknown>
>('DatePicker');
export const provideDatePickerState = createStateProvider(NgpDatePickerStateToken);
export const injectDatePickerState = createStateInjector<
  NgpDatePicker<unknown> | NgpDateRangePicker<unknown>
>(NgpDatePickerStateToken) as <T>() => InjectedState<NgpDatePicker<T> | NgpDateRangePicker<T>>;
export const datePickerState = createState(NgpDatePickerStateToken);
