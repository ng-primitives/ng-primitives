import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { injectDatePickerConfig } from '../config/date-picker-config';
import { transformToFirstDayOfWeekNumber } from '../date-picker/date-picker-first-day-of-week';
import { ngpDateRangePicker, provideDateRangePickerState } from './date-range-picker-state';

@Directive({
  selector: '[ngpDateRangePicker]',
  exportAs: 'ngpDateRangePicker',
  providers: [provideDateRangePickerState()],
})
export class NgpDateRangePicker<T> {
  /**
   * Access the date adapter.
   */
  private readonly dateAdapter = injectDateAdapter<T>();

  /**
   * Access the date range picker config.
   */
  private readonly config = injectDatePickerConfig();

  /**
   * The minimum date that can be selected.
   */
  readonly min = input<T | undefined>(undefined, {
    alias: 'ngpDateRangePickerMin',
  });

  /**
   * The maximum date that can be selected.
   */
  readonly max = input<T | undefined>(undefined, {
    alias: 'ngpDateRangePickerMax',
  });

  /**
   * Determine if the date picker is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpDateRangePickerDisabled',
    transform: booleanAttribute,
  });

  /**
   * A function that is called to determine if a specific date should be disabled.
   */
  readonly dateDisabled = input<(date: T) => boolean>(() => false, {
    alias: 'ngpDateRangePickerDateDisabled',
  });

  /**
   * Sets which day starts the week in the calendar.
   * Accepts 0-7 where 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday.
   * Defaults to NgpDatePickerConfig.firstDayOfWeek (default 7 if not overridden).
   * Note: Update calendar header column order when changing from Sunday start.
   * @default 7 (Sunday)
   */
  readonly firstDayOfWeek = input(transformToFirstDayOfWeekNumber(this.config.firstDayOfWeek), {
    alias: 'ngpDateRangePickerFirstDayOfWeek',
    transform: transformToFirstDayOfWeekNumber,
  });

  /**
   * The selected start date
   */
  readonly startDate = input<T | undefined>(undefined, {
    alias: 'ngpDateRangePickerStartDate',
  });

  /**
   * The default (uncontrolled) start date.
   */
  readonly defaultStartDate = input<T | undefined>(undefined, {
    alias: 'ngpDateRangePickerDefaultStartDate',
  });

  /**
   * Emit when the date changes.
   */
  readonly startDateChange = output<T | undefined>({
    alias: 'ngpDateRangePickerStartDateChange',
  });

  /**
   * The selected end date
   */
  readonly endDate = input<T | undefined>(undefined, {
    alias: 'ngpDateRangePickerEndDate',
  });

  /**
   * The default (uncontrolled) end date.
   */
  readonly defaultEndDate = input<T | undefined>(undefined, {
    alias: 'ngpDateRangePickerDefaultEndDate',
  });

  /**
   * Emit when the end date changes.
   */
  readonly endDateChange = output<T | undefined>({
    alias: 'ngpDateRangePickerEndDateChange',
  });

  /**
   * The focused value.
   */
  readonly focusedDate = input<T | undefined>(undefined, {
    alias: 'ngpDateRangePickerFocusedDate',
  });

  /**
   * The default (uncontrolled) focused value.
   */
  readonly defaultFocusedDate = input<T>(this.dateAdapter.now(), {
    alias: 'ngpDateRangePickerDefaultFocusedDate',
  });

  /**
   * Emit when the focused date changes.
   */
  readonly focusedDateChange = output<T>({
    alias: 'ngpDateRangePickerFocusedDateChange',
  });

  /**
   * The date range picker state.
   */
  protected readonly state = ngpDateRangePicker<T>({
    min: this.min,
    max: this.max,
    disabled: this.disabled,
    dateDisabled: this.dateDisabled,
    firstDayOfWeek: this.firstDayOfWeek,
    startDate: this.startDate,
    defaultStartDate: this.defaultStartDate,
    endDate: this.endDate,
    defaultEndDate: this.defaultEndDate,
    focusedDate: this.focusedDate,
    defaultFocusedDate: this.defaultFocusedDate,
    onStartDateChange: value => this.startDateChange.emit(value),
    onEndDateChange: value => this.endDateChange.emit(value),
    onFocusedDateChange: value => this.focusedDateChange.emit(value),
  });

  /**
   * Select a date within the range.
   * @param date The date to select.
   * @param preserveTime Whether to preserve time components from existing selected dates.
   * @internal
   */
  select(date: T, preserveTime = false): void {
    this.state.select(date, preserveTime);
  }
}
