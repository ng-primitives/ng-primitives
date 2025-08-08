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
import type { NgpDatePickerDateButton } from '../date-picker-date-button/date-picker-date-button';
import { NgpDatePickerLabelToken } from '../date-picker-label/date-picker-label-token';
import { transformToFirstDayOfWeekNumber } from './date-picker-first-day-of-week';
import { datePickerState, provideDatePickerState } from './date-picker-state';

/**
 * The outermost container for the date picker.
 */
@Directive({
  selector: '[ngpDatePicker]',
  exportAs: 'ngpDatePicker',
  providers: [provideDatePickerState()],
  host: {
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
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
   * Access the injector.
   */
  private readonly injector = inject(Injector);

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
   * Emit when the date changes.
   */
  readonly dateChange = output<T | undefined>({
    alias: 'ngpDatePickerDateChange',
  });

  /**
   * The focused value.
   */
  readonly focusedDate = input<T>(this.dateAdapter.now(), {
    alias: 'ngpDatePickerFocusedDate',
  });

  /**
   * Emit when the focused date changes.
   */
  readonly focusedDateChange = output<T>({
    alias: 'ngpDatePickerFocusedDateChange',
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
   * The date picker state.
   */
  protected readonly state = datePickerState<NgpDatePicker<T>>(this);

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
   * @internal
   */
  select(date: T): void {
    this.state.date.set(date);
    this.dateChange.emit(date);
  }

  /**
   * Determine if a date is selected.
   * @param date The date to check.
   * @returns True if the date is selected, false otherwise.
   * @internal
   */
  isSelected(date: T): boolean {
    const selected = this.state.date();
    if (!selected) {
      return false;
    }

    return this.dateAdapter.isSameDay(date, selected);
  }

  /**
   * Determine if a date is the start of a range. In a date picker, this is always false.
   * @param date The date to check.
   * @returns Always false.
   * @internal
   */
  isStartOfRange(_: T): boolean {
    return false;
  }

  /**
   * Determine if a date is the end of a range. In a date picker, this is always false.
   * @param date The date to check.
   * @returns Always false.
   * @internal
   */
  isEndOfRange(_: T): boolean {
    return false;
  }

  /**
   * Determine if a date is between the start and end dates. In a date picker, this is always false.
   * @param date The date to check.
   * @returns True if the date is between the start and end dates, false otherwise.
   * @internal
   */
  isBetweenRange(_: T): boolean {
    return false;
  }
}
