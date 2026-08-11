import { computed, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, listener } from 'ng-primitives/state';
import { injectDateControllerState } from '../date-picker/date-picker-state';

export interface NgpDatePickerPreviousMonthState {
  /**
   * @internal
   * Whether navigating to the previous month is disabled.
   */
  readonly disabled: Signal<boolean>;
}

export interface NgpDatePickerPreviousMonthProps {}

export const [
  NgpDatePickerPreviousMonthStateToken,
  ngpDatePickerPreviousMonth,
  injectDatePickerPreviousMonthState,
  provideDatePickerPreviousMonthState,
] = createPrimitive(
  'NgpDatePickerPreviousMonth',
  <T>({}: NgpDatePickerPreviousMonthProps): NgpDatePickerPreviousMonthState => {
    const elementRef = injectElementRef<HTMLElement>();
    const dateAdapter = injectDateAdapter<T>();
    const state = injectDateControllerState<T>();

    /**
     * Determine if this is a button element.
     */
    const isButton = elementRef.nativeElement.tagName.toLowerCase() === 'button';

    /**
     * Determine if the previous month is disabled.
     */
    const disabled = computed(() => {
      if (state().disabled()) {
        return true;
      }

      const minDate = state().min();

      // if the previous month is out of bounds, disable it.
      const firstDay = dateAdapter.set(dateAdapter.startOfMonth(state().focusedDate()), {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });

      // if there is a min date and it is equal to or after the first day of the month, disable it.
      if (minDate && dateAdapter.compare(minDate, firstDay) >= 0) {
        return true;
      }

      return false;
    });

    // Host bindings
    attrBinding(elementRef, 'aria-disabled', () => (disabled() ? 'true' : null));
    attrBinding(elementRef, 'type', isButton ? 'button' : null);

    // Compose the button behaviour.
    ngpButton({ disabled });

    // Listener
    listener(elementRef, 'click', navigateToPreviousMonth);

    /**
     * Navigate to the previous month.
     */
    function navigateToPreviousMonth(): void {
      if (disabled()) {
        return;
      }

      const focusedDate = state().focusedDate();
      const day = dateAdapter.getDate(focusedDate);

      // Move to the first day of the previous month before restoring the focused
      // day, otherwise a focused date such as the 31st would overflow when the
      // previous month has fewer days.
      let date = dateAdapter.set(focusedDate, {
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      date = dateAdapter.subtract(date, { months: 1 });

      // Preserve the focused day, clamping to the last day of the month when the
      // previous month is shorter (e.g. 31 March -> 28 February).
      const lastDay = dateAdapter.getDate(dateAdapter.endOfMonth(date));
      date = dateAdapter.set(date, { day: Math.min(day, lastDay) });

      state().setFocusedDate(date, 'mouse', 'backward');
    }

    return { disabled } satisfies NgpDatePickerPreviousMonthState;
  },
);
