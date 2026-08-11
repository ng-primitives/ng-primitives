import { FocusMonitor } from '@angular/cdk/a11y';
import { computed, inject, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { injectDatePickerCellDate } from '../date-picker-cell-render/date-picker-cell-render-token';
import { injectDateControllerState } from '../date-picker/date-picker-state';

export interface NgpDatePickerDateButtonState {
  /**
   * @internal
   * Whether this date is selected.
   */
  readonly selected: Signal<boolean>;
  /**
   * @internal
   * Whether this date is disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * @internal
   * Focus this button if it represents the focused date.
   */
  focus(): void;
}

export interface NgpDatePickerDateButtonProps {}

export const [
  NgpDatePickerDateButtonStateToken,
  ngpDatePickerDateButton,
  injectDatePickerDateButtonState,
  provideDatePickerDateButtonState,
] = createPrimitive(
  'NgpDatePickerDateButton',
  <T>({}: NgpDatePickerDateButtonProps): NgpDatePickerDateButtonState => {
    const elementRef = injectElementRef<HTMLElement>();
    const focusMonitor = inject(FocusMonitor);
    const state = injectDateControllerState<T>();
    const dateAdapter = injectDateAdapter<T>();
    const date = injectDatePickerCellDate<T>();

    /**
     * Determine if this is the focused date.
     */
    const focused = computed(() => dateAdapter.isSameDay(date, state().focusedDate()));

    /**
     * Determine if this is the selected date.
     */
    const selected = computed(() => state().isSelected(date));

    /**
     * Determine if this is the start date of the range.
     */
    const start = computed(() => state().isStartOfRange(date));

    /**
     * Determine if this is the end date of the range.
     */
    const end = computed(() => state().isEndOfRange(date));

    /**
     * Determine if this is between the start and end dates of the range.
     */
    const betweenRange = computed(() => state().isBetweenRange(date));

    /**
     * Determine if this date is outside the current month.
     */
    const outside = computed(() => !dateAdapter.isSameMonth(date, state().focusedDate()));

    /**
     * Determine if this date is today.
     */
    const today = computed(() => dateAdapter.isSameDay(date, dateAdapter.now()));

    /**
     * Determine if this date is disabled.
     */
    const disabled = computed(() => {
      const min = state().min();
      const max = state().max();

      if (state().disabled() || state().dateDisabled()(date)) {
        return true;
      }

      if (min && dateAdapter.compare(dateAdapter.startOfDay(date), min) < 0) {
        return true;
      }

      if (max && dateAdapter.compare(dateAdapter.startOfDay(date), max) > 0) {
        return true;
      }

      return false;
    });

    /**
     * Determine if the element is a button.
     */
    const isButton = elementRef.nativeElement.tagName === 'BUTTON';

    // Host bindings
    attrBinding(elementRef, 'role', !isButton ? 'button' : null);
    attrBinding(elementRef, 'tabindex', () => (focused() ? 0 : -1));
    dataBinding(elementRef, 'data-selected', () => (selected() ? '' : null));
    attrBinding(elementRef, 'aria-disabled', disabled);
    dataBinding(elementRef, 'data-outside-month', () => (outside() ? '' : null));
    dataBinding(elementRef, 'data-today', () => (today() ? '' : null));
    dataBinding(elementRef, 'data-range-start', () => (start() ? '' : null));
    dataBinding(elementRef, 'data-range-end', () => (end() ? '' : null));
    dataBinding(elementRef, 'data-range-between', () => (betweenRange() ? '' : null));

    // Compose the button behaviour (disabled state handling, etc.).
    ngpButton({ disabled });

    // Listeners. `listener` binds a raw DOM event, so keyboard navigation is
    // dispatched by key inside a single `keydown` handler rather than via
    // Angular's `keydown.<key>` pseudo-events.
    listener(elementRef, 'click', () => select());
    listener(elementRef, 'keydown', onKeydown);

    function onKeydown(event: KeyboardEvent): void {
      // Angular's `keydown.<key>` host bindings (used before this migration) only
      // matched when no modifier key was held. Preserve that so modifier combos
      // pass through untouched instead of being handled and `preventDefault`-ed —
      // e.g. Alt+ArrowLeft (browser back) or Shift+PageUp/PageDown (year
      // navigation in the WAI-ARIA grid pattern).
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      switch (event.key) {
        case 'Enter':
        case ' ':
          select(event);
          break;
        case 'ArrowLeft':
          focusPrevious(event);
          break;
        case 'ArrowRight':
          focusNext(event);
          break;
        case 'ArrowUp':
          focusAbove(event);
          break;
        case 'ArrowDown':
          focusBelow(event);
          break;
        case 'Home':
          focusFirst(event);
          break;
        case 'End':
          focusLast(event);
          break;
        case 'PageUp':
          focusPreviousMonth(event);
          break;
        case 'PageDown':
          focusNextMonth(event);
          break;
      }
    }

    /**
     * When the button is activated, select the date.
     */
    function select(event?: Event): void {
      // if the button is disabled, do nothing.
      if (disabled()) {
        return;
      }

      // because this may not be a button, we should stop the event from firing twice due to
      // us listening to both the click and the keydown event.
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Select the date with time preservation enabled for button clicks
      state().select(date, true);
      state().setFocusedDate(date, 'mouse', 'forward');
    }

    /**
     * Focus if this is the current focused date.
     */
    function focus(): void {
      if (dateAdapter.isSameDay(date, state().focusedDate())) {
        focusMonitor.focusVia(elementRef, 'keyboard');
      }
    }

    /**
     * Focus the previous cell.
     */
    function focusPrevious(event: Event): void {
      event.preventDefault();
      event.stopPropagation();

      // in rtl, the arrow keys are reversed.
      if (getDirection() === 'rtl') {
        focusDate(dateAdapter.add(state().focusedDate(), { days: 1 }), 'forward');
      } else {
        focusDate(dateAdapter.subtract(state().focusedDate(), { days: 1 }), 'backward');
      }
    }

    /**
     * Focus the next cell.
     */
    function focusNext(event: Event): void {
      event.preventDefault();
      event.stopPropagation();

      // in rtl, the arrow keys are reversed.
      if (getDirection() === 'rtl') {
        focusDate(dateAdapter.subtract(state().focusedDate(), { days: 1 }), 'backward');
      } else {
        focusDate(dateAdapter.add(state().focusedDate(), { days: 1 }), 'forward');
      }
    }

    /**
     * Focus the above cell.
     */
    function focusAbove(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      focusDate(dateAdapter.subtract(state().focusedDate(), { days: 7 }), 'backward');
    }

    /**
     * Focus the below cell.
     */
    function focusBelow(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      focusDate(dateAdapter.add(state().focusedDate(), { days: 7 }), 'forward');
    }

    /**
     * Focus the first date of the month.
     */
    function focusFirst(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      focusDate(dateAdapter.startOfMonth(state().focusedDate()), 'forward');
    }

    /**
     * Focus the last date of the month.
     */
    function focusLast(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      focusDate(dateAdapter.endOfMonth(state().focusedDate()), 'backward');
    }

    /**
     * Focus the same date in the previous month.
     */
    function focusPreviousMonth(event: Event): void {
      event.preventDefault();
      event.stopPropagation();

      const day = dateAdapter.getDate(state().focusedDate());

      let previousMonthTarget = dateAdapter.startOfMonth(state().focusedDate());
      previousMonthTarget = dateAdapter.subtract(previousMonthTarget, { months: 1 });

      const lastDay = dateAdapter.endOfMonth(previousMonthTarget);

      // if we are on a date that does not exist in the previous month, we should focus the last day of the month.
      if (day > dateAdapter.getDate(lastDay)) {
        focusDate(lastDay, 'forward');
      } else {
        focusDate(dateAdapter.set(previousMonthTarget, { day }), 'forward');
      }
    }

    /**
     * Focus the same date in the next month.
     */
    function focusNextMonth(event: Event): void {
      event.preventDefault();
      event.stopPropagation();

      const day = dateAdapter.getDate(state().focusedDate());

      let nextMonthTarget = dateAdapter.startOfMonth(state().focusedDate());
      nextMonthTarget = dateAdapter.add(nextMonthTarget, { months: 1 });

      const lastDay = dateAdapter.endOfMonth(nextMonthTarget);

      // if we are on a date that does not exist in the next month, we should focus the last day of the month.
      if (day > dateAdapter.getDate(lastDay)) {
        focusDate(lastDay, 'backward');
      } else {
        focusDate(dateAdapter.set(nextMonthTarget, { day }), 'backward');
      }
    }

    function focusDate(target: T, direction: 'forward' | 'backward'): void {
      state().setFocusedDate(target, 'keyboard', direction);
    }

    /**
     * Get the direction of the element.
     */
    function getDirection(): 'ltr' | 'rtl' {
      return getComputedStyle(elementRef.nativeElement).direction === 'rtl' ? 'rtl' : 'ltr';
    }

    const buttonState = {
      selected,
      disabled,
      focus,
    } satisfies NgpDatePickerDateButtonState;

    // Register with the containing picker so keyboard navigation can move focus
    // between cells; always deregister on teardown.
    state().registerButton(buttonState);
    onDestroy(() => state().unregisterButton(buttonState));

    return buttonState;
  },
);
