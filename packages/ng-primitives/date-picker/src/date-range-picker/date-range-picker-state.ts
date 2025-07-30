import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  InjectedState,
} from 'ng-primitives/state';
import type { NgpDateRangePicker } from './date-range-picker';

/**
 * The state token  for the DateRangePicker primitive.
 */
export const NgpDateRangePickerStateToken =
  createStateToken<NgpDateRangePicker<unknown>>('DateRangePicker');

/**
 * Provides the DateRangePicker state.
 */
export const provideDateRangePickerState = createStateProvider(NgpDateRangePickerStateToken);

/**
 * Injects the DateRangePicker state.
 */
export const injectDateRangePickerState = createStateInjector<NgpDateRangePicker<unknown>>(
  NgpDateRangePickerStateToken,
) as <T>() => InjectedState<NgpDateRangePicker<T>>;

/**
 * The DateRangePicker state registration function.
 */
export const dateRangePickerState = createState(NgpDateRangePickerStateToken);
