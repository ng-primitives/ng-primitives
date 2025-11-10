import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  afterNextRender,
  booleanAttribute,
  contentChild,
  Directive,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { injectDatePickerConfig } from '../config/date-picker-config';
import { NgpDatePickerDateButton } from '../date-picker-date-button/date-picker-date-button';
import { NgpDatePickerLabelToken } from '../date-picker-label/date-picker-label-token';
import { transformToFirstDayOfWeekNumber } from '../date-picker/date-picker-first-day-of-week';
import { dateRangePickerState, provideDateRangePickerState } from './date-range-picker-state';

@Directive({
  selector: '[ngpDateRangePicker]',
  exportAs: 'ngpDateRangePicker',
  providers: [provideDateRangePickerState()],
  host: {
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
})
export class NgpDateRangePicker<T> {
  private readonly dateAdapter = injectDateAdapter<T>();

  /**
   * Access the date range picker config.
   */
  private readonly config = injectDatePickerConfig();

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

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
   * Emit when the end date changes.
   */
  readonly endDateChange = output<T | undefined>({
    alias: 'ngpDateRangePickerEndDateChange',
  });

  /**
   * The focused value.
   */
  readonly focusedDate = input<T>(this.dateAdapter.now(), {
    alias: 'ngpDateRangePickerFocusedDate',
  });

  /**
   * Emit when the focused date changes.
   */
  readonly focusedDateChange = output<T>({
    alias: 'ngpDateRangePickerFocusedDateChange',
  });

  /**
   * Detect the label element.
   * @internal
   */
  readonly label = contentChild(NgpDatePickerLabelToken, { descendants: true });

  /**
   * Access all the date picker buttons
   */
  private readonly buttons = signal<NgpDatePickerDateButton<T>[]>([]);

  /**
   * The date range picker state.
   */
  private readonly state = dateRangePickerState<NgpDateRangePicker<T>>(this);

  /**
   * Set the focused date.
   * @param date The date to focus.
   * @internal
   */
  setFocusedDate(date: T, origin: FocusOrigin = 'mouse', direction: 'forward' | 'backward'): void {
    if (this.state.disabled()) {
      return;
    }

    const min = this.state.min();
    const max = this.state.max();

    if (min && this.dateAdapter.isBefore(date, min)) {
      date = min;
    }

    if (max && this.dateAdapter.isAfter(date, max)) {
      date = max;
    }

    // if the date is disabled, find the next available date in the specified direction.
    if (this.state.dateDisabled()(date)) {
      let nextDate = this.dateAdapter.add(date, { days: direction === 'forward' ? 1 : -1 });

      while (
        this.state.dateDisabled()(nextDate) ||
        (min && this.dateAdapter.isBefore(nextDate, min)) ||
        (max && this.dateAdapter.isAfter(nextDate, max))
      ) {
        nextDate = this.dateAdapter.add(nextDate, { days: direction === 'forward' ? 1 : -1 });
      }

      date = nextDate;
    }

    this.state.focusedDate.set(date);
    this.focusedDateChange.emit(date);

    if (origin === 'keyboard') {
      afterNextRender(
        {
          write: () => this.buttons().forEach(button => button.focus()),
        },
        {
          injector: this.injector,
        },
      );
    }
  }

  /**
   * Register a date button.
   * @param button The date button to register.
   * @internal
   */
  registerButton(button: NgpDatePickerDateButton<T>): void {
    this.buttons.update(buttons => [...buttons, button]);
  }

  /**
   * Unregister a date button.
   * @param button The date button to unregister.
   * @internal
   */
  unregisterButton(button: NgpDatePickerDateButton<T>): void {
    this.buttons.update(buttons => buttons.filter(b => b !== button));
  }

  /**
   * Select a date.
   * @param date The date to select.
   * @param preserveTime Whether to preserve time components from existing selected dates.
   * @internal
   */
  /**
   * Handles the selection of a date within the date range picker.
   *
   * Selection logic:
   * - If neither a start date nor an end date is selected:
   *   - Sets the selected date as the start date.
   * - If a start date is selected but no end date:
   *   - If the selected date is after the start date, sets it as the end date.
   *   - If the selected date is before the start date, sets the selected date as the start date
   *     and the previous start date as the end date.
   *   - If the selected date is the same as the start date, sets the selected date as the end date
   *     to select a single date.
   * - If both start and end dates are already selected:
   *   - Resets the selection, setting the selected date as the new start date and clearing the end date.
   *
   * @param date The date to select.
   * @param preserveTime Whether to preserve time components from existing selected dates.
   */
  select(date: T, preserveTime = false): void {
    const start = this.state.startDate();
    const end = this.state.endDate();

    // Helper function to preserve time components when preserveTime is enabled
    const maybePreserveTime = (newDate: T, existingDate: T | undefined): T => {
      if (!preserveTime || !existingDate) {
        return newDate;
      }

      return this.dateAdapter.set(existingDate, {
        year: this.dateAdapter.getYear(newDate),
        month: this.dateAdapter.getMonth(newDate),
        day: this.dateAdapter.getDate(newDate),
      });
    };

    if (!start && !end) {
      const selectedDate = maybePreserveTime(date, undefined);
      this.state.startDate.set(selectedDate);
      this.startDateChange.emit(selectedDate);
      return;
    }

    if (start && !end) {
      if (this.dateAdapter.isAfter(date, start)) {
        const selectedDate = maybePreserveTime(date, undefined);
        this.state.endDate.set(selectedDate);
        this.endDateChange.emit(selectedDate);
      } else if (this.dateAdapter.isBefore(date, start)) {
        const selectedStartDate = maybePreserveTime(date, start);
        this.state.startDate.set(selectedStartDate);
        this.state.endDate.set(start);
        this.startDateChange.emit(selectedStartDate);
        this.endDateChange.emit(start);
      } else if (this.dateAdapter.isSameDay(date, start)) {
        const selectedDate = maybePreserveTime(date, undefined);
        this.state.endDate.set(selectedDate);
        this.endDateChange.emit(selectedDate);
      }
      return;
    }

    // If both start and end are selected, reset selection
    const selectedDate = maybePreserveTime(date, start);
    this.state.startDate.set(selectedDate);
    this.startDateChange.emit(selectedDate);
    this.state.endDate.set(undefined);
    this.endDateChange.emit(undefined);
  }

  /**
   * Determine if a date is selected. A date is selected if it is either the start date or the end date.
   * @param date The date to check.
   * @returns True if the date is selected, false otherwise.
   * @internal
   */
  isSelected(date: T): boolean {
    const start = this.state.startDate();
    const end = this.state.endDate();

    if (!start && !end) {
      return false;
    }

    const isStartSelected = start ? this.dateAdapter.isSameDay(date, start) : false;
    const isEndSelected = end ? this.dateAdapter.isSameDay(date, end) : false;

    return isStartSelected || isEndSelected;
  }

  /**
   * Determine if a date is the start of a range.
   * @param date The date to check.
   * @returns Always false.
   * @internal
   */
  isStartOfRange(date: T): boolean {
    const start = this.state.startDate();
    return start ? this.dateAdapter.isSameDay(date, start) : false;
  }

  /**
   * Determine if a date is the end of a range.
   * @param date The date to check.
   * @returns Always false.
   * @internal
   */
  isEndOfRange(date: T): boolean {
    const end = this.state.endDate();
    return end ? this.dateAdapter.isSameDay(date, end) : false;
  }

  /**
   * Determine if a date is between the start and end dates.
   * @param date The date to check.
   * @returns True if the date is between the start and end dates, false otherwise.
   * @internal
   */
  isBetweenRange(date: T): boolean {
    const start = this.state.startDate();
    const end = this.state.endDate();

    if (!start || !end) {
      return false;
    }

    return this.dateAdapter.isAfter(date, start) && this.dateAdapter.isBefore(date, end);
  }
}
