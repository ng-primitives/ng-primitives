import { FocusOrigin } from '@angular/cdk/a11y';
import { afterNextRender, inject, Injector, signal, Signal, WritableSignal } from '@angular/core';
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
import { injectDateRangePickerState } from '../date-range-picker/date-range-picker-state';
import { NgpDatePickerFirstDayOfWeekNumber } from './date-picker-first-day-of-week';

/**
 * The shape shared by the date picker and the date range picker. Every part
 * (grid, label, cell, date button, month navigation, row render) reads this
 * interface via `injectDateControllerState`, so both controllers must satisfy it.
 */
export interface NgpDateControllerState<T> {
  /**
   * Whether the date picker is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * The minimum selectable date.
   */
  readonly min: Signal<T | undefined>;
  /**
   * The maximum selectable date.
   */
  readonly max: Signal<T | undefined>;
  /**
   * A predicate that determines whether a specific date is disabled.
   */
  readonly dateDisabled: Signal<(date: T) => boolean>;
  /**
   * The day that starts the week in the calendar (1-7).
   */
  readonly firstDayOfWeek: Signal<NgpDatePickerFirstDayOfWeekNumber>;
  /**
   * The focused date (the roving-focus cursor).
   */
  readonly focusedDate: Signal<T>;
  /**
   * @internal
   * The id of the registered label, or `undefined` when none is present. The
   * grid reflects this on `aria-labelledby`.
   */
  readonly labelledBy: Signal<string | undefined>;
  /**
   * Set the focused date, clamping to `min`/`max` and skipping disabled dates.
   */
  setFocusedDate(date: T, origin: FocusOrigin, direction: 'forward' | 'backward'): void;
  /**
   * Select a date.
   */
  select(date: T, preserveTime?: boolean, options?: SetterOptions): void;
  /**
   * Set the disabled state.
   */
  setDisabled(value: boolean): void;
  /**
   * Determine whether a date is selected.
   */
  isSelected(date: T): boolean;
  /**
   * Determine whether a date is the start of the range.
   */
  isStartOfRange(date: T): boolean;
  /**
   * Determine whether a date is the end of the range.
   */
  isEndOfRange(date: T): boolean;
  /**
   * Determine whether a date is between the start and end of the range.
   */
  isBetweenRange(date: T): boolean;
  /**
   * @internal
   * Register a date button so keyboard navigation can move focus between cells.
   */
  registerButton(button: NgpDatePickerDateButtonState): void;
  /**
   * @internal
   * Deregister a date button.
   */
  unregisterButton(button: NgpDatePickerDateButtonState): void;
  /**
   * @internal
   * Register the label id used for `aria-labelledby`.
   */
  setLabel(id: string): void;
  /**
   * @internal
   * Deregister the label id.
   */
  removeLabel(id: string): void;
}

export interface NgpDatePickerState<T> extends NgpDateControllerState<T> {
  /**
   * The selected date.
   */
  readonly date: Signal<T | undefined>;
  /**
   * Emits when the selected date changes.
   */
  readonly dateChange: Observable<T | undefined>;
  /**
   * Set the default (uncontrolled) selected date.
   */
  setDefaultDate(value: T | undefined): void;
  /**
   * Set the default (uncontrolled) focused date.
   */
  setDefaultFocusedDate(value: T): void;
}

export interface NgpDatePickerProps<T> {
  /**
   * The minimum selectable date.
   */
  readonly min?: Signal<T | undefined>;
  /**
   * The maximum selectable date.
   */
  readonly max?: Signal<T | undefined>;
  /**
   * Whether the date picker is disabled.
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
   * The selected date.
   */
  readonly date?: Signal<T | undefined>;
  /**
   * The default (uncontrolled) selected date.
   */
  readonly defaultDate?: Signal<T | undefined>;
  /**
   * The focused date.
   */
  readonly focusedDate?: Signal<T | undefined>;
  /**
   * The default (uncontrolled) focused date.
   */
  readonly defaultFocusedDate?: Signal<T>;
  /**
   * Called when the selected date changes.
   */
  readonly onDateChange?: (value: T | undefined) => void;
  /**
   * Called when the focused date changes.
   */
  readonly onFocusedDateChange?: (value: T) => void;
}

export const [
  NgpDatePickerStateToken,
  ngpDatePicker,
  _injectDatePickerState,
  provideDatePickerState,
] = createPrimitive(
  'NgpDatePicker',
  <T>({
    min = signal<T | undefined>(undefined),
    max = signal<T | undefined>(undefined),
    dateDisabled = signal<(date: T) => boolean>(() => false),
    firstDayOfWeek = signal<NgpDatePickerFirstDayOfWeekNumber>(7),
    disabled: _disabled = signal<boolean>(false),
    date: _date = signal<T | undefined>(undefined),
    defaultDate: _defaultDate,
    focusedDate: _focusedDate = signal<T | undefined>(undefined),
    defaultFocusedDate: _defaultFocusedDate,
    onDateChange,
    onFocusedDateChange,
  }: NgpDatePickerProps<T>) => {
    const elementRef = injectElementRef();
    const dateAdapter = injectDateAdapter<T>();
    const injector = inject(Injector);

    const disabled = controlled(_disabled);

    // Two-way value inputs use `controlledState` so controlled/uncontrolled mode
    // latches: a value bound one-way is pinned to its binding and only mutates
    // internally in uncontrolled mode. The uncontrolled initial value comes from
    // the sibling `default*` input.
    const defaultDate = controlled(_defaultDate, undefined);
    const [dateValue, setDate, dateChange] = controlledState<T | undefined>({
      value: _date,
      defaultValue: defaultDate,
      onChange: onDateChange,
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

    function setDefaultDate(value: T | undefined): void {
      defaultDate.set(value);
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

        // advance in the travel direction over disabled dates, but stop at the bounds
        // so we never overshoot min/max (which would loop forever).
        while (
          dateDisabled()(nextDate) &&
          (!minValue || !dateAdapter.isBefore(nextDate, minValue)) &&
          (!maxValue || !dateAdapter.isAfter(nextDate, maxValue))
        ) {
          nextDate = dateAdapter.add(nextDate, { days: direction === 'forward' ? 1 : -1 });
        }

        // only move focus if we landed on an enabled, in-bounds date; otherwise keep
        // the clamped date rather than focusing something out of range.
        const outOfBounds =
          (!!minValue && dateAdapter.isBefore(nextDate, minValue)) ||
          (!!maxValue && dateAdapter.isAfter(nextDate, maxValue));

        if (!dateDisabled()(nextDate) && !outOfBounds) {
          date = nextDate;
        }
      }

      setFocused(date);

      if (origin === 'keyboard') {
        afterNextRender({ write: () => buttons().forEach(button => button.focus()) }, { injector });
      }
    }

    function select(date: T, preserveTime = false, options: SetterOptions = {}): void {
      let selectedDate = date;

      if (preserveTime && date != null) {
        const existingDate = dateValue();
        if (existingDate) {
          selectedDate = dateAdapter.set(existingDate, {
            year: dateAdapter.getYear(date),
            month: dateAdapter.getMonth(date),
            day: dateAdapter.getDate(date),
          });
        }
      }

      setDate(selectedDate, options);
    }

    function isSelected(value: T): boolean {
      const selected = dateValue();
      if (!selected) {
        return false;
      }

      return dateAdapter.isSameDay(value, selected);
    }

    // In a single date picker there is no range, so the range predicates are always false.
    function isStartOfRange(_: T): boolean {
      return false;
    }

    function isEndOfRange(_: T): boolean {
      return false;
    }

    function isBetweenRange(_: T): boolean {
      return false;
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
      date: dateValue,
      focusedDate,
      labelledBy: labelId.asReadonly(),
      dateChange,
      setFocusedDate,
      select,
      setDisabled,
      setDefaultDate,
      setDefaultFocusedDate,
      isSelected,
      isStartOfRange,
      isEndOfRange,
      isBetweenRange,
      registerButton,
      unregisterButton,
      setLabel,
      removeLabel,
    } satisfies NgpDatePickerState<T>;
  },
);

export function injectDatePickerState<T>(): Signal<NgpDatePickerState<T>>;
export function injectDatePickerState<T>(
  options: StateInjectionOptions,
): Signal<NgpDatePickerState<T> | null>;
export function injectDatePickerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpDatePickerState<T> | null> {
  return _injectDatePickerState(options) as Signal<NgpDatePickerState<T> | null>;
}

/**
 * Resolve the controller state of the containing date picker or date range picker.
 * Every date picker part uses this so it works inside either container.
 */
export function injectDateControllerState<T>(): Signal<NgpDateControllerState<T>> {
  const datePicker = injectDatePickerState<T>({ optional: true });
  const dateRangePicker = injectDateRangePickerState<T>({ optional: true });

  if (datePicker()) {
    return datePicker as Signal<NgpDateControllerState<T>>;
  } else if (dateRangePicker()) {
    return dateRangePicker as Signal<NgpDateControllerState<T>>;
  } else {
    throw new Error('No date picker or date range picker state found');
  }
}
