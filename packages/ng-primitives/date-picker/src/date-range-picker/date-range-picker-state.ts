import { FocusOrigin } from '@angular/cdk/a11y';
import { afterNextRender, inject, Injector, signal, Signal } from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { injectElementRef } from 'ng-primitives/internal';
import {
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  SetterOptions,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';
import type { NgpDatePickerDateButtonState } from '../date-picker-date-button/date-picker-date-button-state';
import { NgpDatePickerFirstDayOfWeekNumber } from '../date-picker/date-picker-first-day-of-week';
import type { NgpDateControllerState } from '../date-picker/date-picker-state';

export interface NgpDateRangePickerState<T> extends NgpDateControllerState<T> {
  /**
   * The selected start date.
   */
  readonly startDate: Signal<T | undefined>;
  /**
   * The selected end date.
   */
  readonly endDate: Signal<T | undefined>;
  /**
   * Emits when the start date changes.
   */
  readonly startDateChange: Observable<T | undefined>;
  /**
   * Emits when the end date changes.
   */
  readonly endDateChange: Observable<T | undefined>;
  /**
   * Set the default (uncontrolled) start date.
   */
  setDefaultStartDate(value: T | undefined): void;
  /**
   * Set the default (uncontrolled) end date.
   */
  setDefaultEndDate(value: T | undefined): void;
  /**
   * Set the default (uncontrolled) focused date.
   */
  setDefaultFocusedDate(value: T): void;
}

export interface NgpDateRangePickerProps<T> {
  /**
   * The minimum selectable date.
   */
  readonly min?: Signal<T | undefined>;
  /**
   * The maximum selectable date.
   */
  readonly max?: Signal<T | undefined>;
  /**
   * Whether the date range picker is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * A predicate that determines whether a specific date is disabled.
   */
  readonly dateDisabled?: Signal<(date: T) => boolean>;
  /**
   * The day that starts the week in the calendar (1-7).
   */
  readonly firstDayOfWeek?: Signal<NgpDatePickerFirstDayOfWeekNumber>;
  /**
   * The selected start date.
   */
  readonly startDate?: Signal<T | undefined>;
  /**
   * The default (uncontrolled) start date.
   */
  readonly defaultStartDate?: Signal<T | undefined>;
  /**
   * The selected end date.
   */
  readonly endDate?: Signal<T | undefined>;
  /**
   * The default (uncontrolled) end date.
   */
  readonly defaultEndDate?: Signal<T | undefined>;
  /**
   * The focused date.
   */
  readonly focusedDate?: Signal<T | undefined>;
  /**
   * The default (uncontrolled) focused date.
   */
  readonly defaultFocusedDate?: Signal<T>;
  /**
   * Called when the start date changes.
   */
  readonly onStartDateChange?: (value: T | undefined) => void;
  /**
   * Called when the end date changes.
   */
  readonly onEndDateChange?: (value: T | undefined) => void;
  /**
   * Called when the focused date changes.
   */
  readonly onFocusedDateChange?: (value: T) => void;
}

export const [
  NgpDateRangePickerStateToken,
  ngpDateRangePicker,
  _injectDateRangePickerState,
  provideDateRangePickerState,
] = createPrimitive(
  'NgpDateRangePicker',
  <T>({
    min = signal<T | undefined>(undefined),
    max = signal<T | undefined>(undefined),
    dateDisabled = signal<(date: T) => boolean>(() => false),
    firstDayOfWeek = signal<NgpDatePickerFirstDayOfWeekNumber>(7),
    disabled: _disabled = signal<boolean>(false),
    startDate: _startDate = signal<T | undefined>(undefined),
    defaultStartDate: _defaultStartDate,
    endDate: _endDate = signal<T | undefined>(undefined),
    defaultEndDate: _defaultEndDate,
    focusedDate: _focusedDate = signal<T | undefined>(undefined),
    defaultFocusedDate: _defaultFocusedDate,
    onStartDateChange,
    onEndDateChange,
    onFocusedDateChange,
  }: NgpDateRangePickerProps<T>) => {
    const elementRef = injectElementRef();
    const dateAdapter = injectDateAdapter<T>();
    const injector = inject(Injector);

    const disabled = controlled(_disabled);

    // Two-way value inputs use `controlledState` so controlled/uncontrolled mode
    // latches (see the single date picker for the rationale). Uncontrolled
    // initial values come from the sibling `default*` inputs.
    const defaultStartDate = controlled(_defaultStartDate, undefined);
    const [startDate, setStart, startDateChange] = controlledState<T | undefined>({
      value: _startDate,
      defaultValue: defaultStartDate,
      onChange: onStartDateChange,
    });

    const defaultEndDate = controlled(_defaultEndDate, undefined);
    const [endDate, setEnd, endDateChange] = controlledState<T | undefined>({
      value: _endDate,
      defaultValue: defaultEndDate,
      onChange: onEndDateChange,
    });

    const defaultFocusedDate = controlled(_defaultFocusedDate, dateAdapter.now());
    const [focusedDate, setFocused] = controlledState<T>({
      value: _focusedDate,
      defaultValue: defaultFocusedDate,
      onChange: onFocusedDateChange,
    });

    // The registered date buttons, kept private; parts register through
    // registerButton/unregisterButton rather than mutating this signal.
    const buttons = signal<NgpDatePickerDateButtonState[]>([]);

    // The registered label id, kept private; the label registers through
    // setLabel/removeLabel and the grid reflects it via `labelledBy`.
    const labelId = signal<string | undefined>(undefined);

    // Host binding
    dataBinding(elementRef, 'data-disabled', () => (disabled() ? '' : null));

    function setDisabled(value: boolean): void {
      disabled.set(value);
    }

    function setDefaultStartDate(value: T | undefined): void {
      defaultStartDate.set(value);
    }

    function setDefaultEndDate(value: T | undefined): void {
      defaultEndDate.set(value);
    }

    function setDefaultFocusedDate(value: T): void {
      defaultFocusedDate.set(value);
    }

    function setFocusedDate(date: T, origin: FocusOrigin, direction: 'forward' | 'backward'): void {
      if (disabled()) {
        return;
      }

      const minValue = min();
      const maxValue = max();

      if (minValue && dateAdapter.isBefore(date, minValue)) {
        date = minValue;
      }

      if (maxValue && dateAdapter.isAfter(date, maxValue)) {
        date = maxValue;
      }

      // if the date is disabled, find the next available date in the specified direction.
      if (dateDisabled()(date)) {
        let nextDate = dateAdapter.add(date, { days: direction === 'forward' ? 1 : -1 });

        while (
          dateDisabled()(nextDate) ||
          (minValue && dateAdapter.isBefore(nextDate, minValue)) ||
          (maxValue && dateAdapter.isAfter(nextDate, maxValue))
        ) {
          nextDate = dateAdapter.add(nextDate, { days: direction === 'forward' ? 1 : -1 });
        }

        date = nextDate;
      }

      setFocused(date);

      if (origin === 'keyboard') {
        afterNextRender({ write: () => buttons().forEach(button => button.focus()) }, { injector });
      }
    }

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
     */
    function select(date: T, preserveTime = false, options: SetterOptions = {}): void {
      const start = startDate();
      const end = endDate();

      // Helper function to preserve time components when preserveTime is enabled
      const maybePreserveTime = (newDate: T, existingDate: T | undefined): T => {
        if (!preserveTime || !existingDate) {
          return newDate;
        }

        return dateAdapter.set(existingDate, {
          year: dateAdapter.getYear(newDate),
          month: dateAdapter.getMonth(newDate),
          day: dateAdapter.getDate(newDate),
        });
      };

      // `setStart`/`setEnd` are the controlledState setters: they latch, emit the
      // change (output + observable), and honor `{ emit: false }`.
      if (!start && !end) {
        setStart(maybePreserveTime(date, undefined), options);
        return;
      }

      if (start && !end) {
        if (dateAdapter.isAfter(date, start)) {
          setEnd(maybePreserveTime(date, undefined), options);
        } else if (dateAdapter.isBefore(date, start)) {
          setStart(maybePreserveTime(date, start), options);
          setEnd(start, options);
        } else if (dateAdapter.isSameDay(date, start)) {
          setEnd(maybePreserveTime(date, undefined), options);
        }
        return;
      }

      // If both start and end are selected, reset selection
      setStart(maybePreserveTime(date, start), options);
      setEnd(undefined, options);
    }

    function isSelected(date: T): boolean {
      const start = startDate();
      const end = endDate();

      if (!start && !end) {
        return false;
      }

      const isStartSelected = start ? dateAdapter.isSameDay(date, start) : false;
      const isEndSelected = end ? dateAdapter.isSameDay(date, end) : false;

      return isStartSelected || isEndSelected;
    }

    function isStartOfRange(date: T): boolean {
      const start = startDate();
      return start ? dateAdapter.isSameDay(date, start) : false;
    }

    function isEndOfRange(date: T): boolean {
      const end = endDate();
      return end ? dateAdapter.isSameDay(date, end) : false;
    }

    function isBetweenRange(date: T): boolean {
      const start = startDate();
      const end = endDate();

      if (!start || !end) {
        return false;
      }

      return dateAdapter.isAfter(date, start) && dateAdapter.isBefore(date, end);
    }

    function registerButton(button: NgpDatePickerDateButtonState): void {
      if (!buttons().includes(button)) {
        buttons.update(current => [...current, button]);
      }
    }

    function unregisterButton(button: NgpDatePickerDateButtonState): void {
      buttons.update(current => current.filter(b => b !== button));
    }

    function setLabel(id: string): void {
      labelId.set(id);
    }

    function removeLabel(id: string): void {
      // only clear if this label is still the active one, so a newer label that
      // has taken over isn't clobbered when an old one is torn down.
      if (labelId() === id) {
        labelId.set(undefined);
      }
    }

    return {
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      min,
      max,
      dateDisabled,
      firstDayOfWeek,
      focusedDate,
      labelledBy: labelId.asReadonly(),
      startDate,
      endDate,
      startDateChange,
      endDateChange,
      setFocusedDate,
      select,
      setDisabled,
      setDefaultStartDate,
      setDefaultEndDate,
      setDefaultFocusedDate,
      isSelected,
      isStartOfRange,
      isEndOfRange,
      isBetweenRange,
      registerButton,
      unregisterButton,
      setLabel,
      removeLabel,
    } satisfies NgpDateRangePickerState<T>;
  },
);

export function injectDateRangePickerState<T>(): Signal<NgpDateRangePickerState<T>>;
export function injectDateRangePickerState<T>(
  options: StateInjectionOptions,
): Signal<NgpDateRangePickerState<T> | null>;
export function injectDateRangePickerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpDateRangePickerState<T> | null> {
  return _injectDateRangePickerState(options) as Signal<NgpDateRangePickerState<T> | null>;
}
