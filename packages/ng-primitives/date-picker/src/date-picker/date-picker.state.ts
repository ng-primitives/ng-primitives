import { OutputEmitterRef, Signal } from '@angular/core';
import { createState, State } from 'ng-primitives/state';

/**
 * The state for the date-picker primitive.
 */
export interface NgpDatePickerState<T> {
  /**
   * The minimum date that can be selected.
   */
  min: Signal<T | undefined>;

  /**
   * The maximum date that can be selected.
   */
  max: Signal<T | undefined>;

  /**
   * Determine if the date picker is disabled.
   */
  disabled: Signal<boolean>;

  /**
   * The currently selected date.
   */
  date: Signal<T | undefined>;

  /**
   * Whether a specific date is disabled.
   */
  dateDisabled: Signal<(date: T) => boolean>;

  /**
   * Emit when the selected date changes.
   */
  dateChange: OutputEmitterRef<T | undefined>;

  /**
   * The currently focused date.
   */
  focusedDate: Signal<T>;

  /**
   * Emit when the focused date changes.
   */
  focusedDateChange: OutputEmitterRef<T>;
}

/**
 * The initial state for the date-picker primitive.
 */
const { provideDatePickerState, ...state } = createState<NgpDatePickerState<unknown>>('DatePicker');

export { provideDatePickerState };

/**
 * Inject the date-picker state.
 */
export const injectDatePickerState = state['injectDatePickerState'] as <T>() => State<
  NgpDatePickerState<T>
>;

/**
 * Update the date-picker state.
 */
export const datePickerState = state['datePickerState'] as <T>(
  state: NgpDatePickerState<T>,
) => State<NgpDatePickerState<T>>;
