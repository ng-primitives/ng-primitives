import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  InjectedState,
} from 'ng-primitives/state';
import type { NgpDatePicker } from './date-picker';

export const NgpDatePickerStateToken = createStateToken<NgpDatePicker<unknown>>('DatePicker');
export const provideDatePickerState = createStateProvider(NgpDatePickerStateToken);
export const injectDatePickerState = createStateInjector<NgpDatePicker<unknown>>(
  NgpDatePickerStateToken,
) as <T>() => InjectedState<NgpDatePicker<T>>;
export const datePickerState = createState(NgpDatePickerStateToken);
