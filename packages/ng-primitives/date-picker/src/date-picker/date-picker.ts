import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { SetterOptions } from 'ng-primitives/state';
import { injectDatePickerConfig } from '../config/date-picker-config';
import { transformToFirstDayOfWeekNumber } from './date-picker-first-day-of-week';
import { ngpDatePicker, provideDatePickerState } from './date-picker-state';

/**
 * The outermost container for the date picker.
 */
@Directive({
  selector: '[ngpDatePicker]',
  exportAs: 'ngpDatePicker',
  providers: [provideDatePickerState()],
})
export class NgpDatePicker<T> {
  /**
   * Access the date adapter.
   */
  private readonly dateAdapter = injectDateAdapter<T>();

  /**
   * Access the date picker config.
   */
  private readonly config = injectDatePickerConfig();

  /**
   * The minimum date that can be selected.
   */
  readonly min = input<T | undefined>(undefined, {
    alias: 'ngpDatePickerMin',
  });

  /**
   * The maximum date that can be selected.
   */
  readonly max = input<T | undefined>(undefined, {
    alias: 'ngpDatePickerMax',
  });

  /**
   * Determine if the date picker is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpDatePickerDisabled',
    transform: booleanAttribute,
  });

  /**
   * A function that is called to determine if a specific date should be disabled.
   */
  readonly dateDisabled = input<(date: T) => boolean>(() => false, {
    alias: 'ngpDatePickerDateDisabled',
  });

  /**
   * Sets which day starts the week in the calendar.
   * Accepts 0-7 where 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday.
   * Defaults to NgpDatePickerConfig.firstDayOfWeek (default 7 if not overridden).
   * Note: Update calendar header column order when changing from Sunday start.
   * @default 7 (Sunday)
   */
  readonly firstDayOfWeek = input(transformToFirstDayOfWeekNumber(this.config.firstDayOfWeek), {
    alias: 'ngpDatePickerFirstDayOfWeek',
    transform: transformToFirstDayOfWeekNumber,
  });

  /**
   * The selected value.
   */
  readonly date = input<T | undefined>(undefined, {
    alias: 'ngpDatePickerDate',
  });

  /**
   * The default (uncontrolled) selected value.
   */
  readonly defaultDate = input<T | undefined>(undefined, {
    alias: 'ngpDatePickerDefaultDate',
  });

  /**
   * Emit when the date changes.
   */
  readonly dateChange = output<T | undefined>({
    alias: 'ngpDatePickerDateChange',
  });

  /**
   * The focused value.
   */
  readonly focusedDate = input<T | undefined>(undefined, {
    alias: 'ngpDatePickerFocusedDate',
  });

  /**
   * The default (uncontrolled) focused value.
   */
  readonly defaultFocusedDate = input<T>(this.dateAdapter.now(), {
    alias: 'ngpDatePickerDefaultFocusedDate',
  });

  /**
   * Emit when the focused date changes.
   */
  readonly focusedDateChange = output<T>({
    alias: 'ngpDatePickerFocusedDateChange',
  });

  /**
   * The date picker state.
   */
  protected readonly state = ngpDatePicker<T>({
    min: this.min,
    max: this.max,
    disabled: this.disabled,
    dateDisabled: this.dateDisabled,
    firstDayOfWeek: this.firstDayOfWeek,
    date: this.date,
    defaultDate: this.defaultDate,
    focusedDate: this.focusedDate,
    defaultFocusedDate: this.defaultFocusedDate,
    onDateChange: value => this.dateChange.emit(value),
    onFocusedDateChange: value => this.focusedDateChange.emit(value),
  });

  /**
   * Select a date.
   * @param date The date to select.
   * @param preserveTime Whether to preserve time components from existing selected date.
   * @param options Options for the selection. Set `emit` to false to update the state without
   * emitting `dateChange` (e.g. when writing a value from a form model).
   * @internal
   */
  select(date: T, preserveTime = false, options: SetterOptions = {}): void {
    this.state.select(date, preserveTime, options);
  }
}
