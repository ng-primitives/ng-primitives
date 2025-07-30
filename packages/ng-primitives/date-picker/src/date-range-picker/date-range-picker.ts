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
import { NgpDatePickerDateButton } from '../date-picker-date-button/date-picker-date-button';
import { NgpDatePickerLabelToken } from '../date-picker-label/date-picker-label-token';
import { dateRangePickerState, provideDateRangePickerState } from './date-range-picker-state';

@Directive({
  selector: '[ngpDateRangePicker]',
  exportAs: 'ngpDateRangePicker',
  providers: [provideDateRangePickerState()],
})
export class NgpDateRangePicker<T> {
  private readonly dateAdapter = injectDateAdapter<T>();

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
}
