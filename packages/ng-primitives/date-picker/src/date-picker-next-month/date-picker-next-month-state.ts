import { computed, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, listener } from 'ng-primitives/state';
import { injectDateControllerState } from '../date-picker/date-picker-state';

export interface NgpDatePickerNextMonthState {
  /**
   * @internal
   * Whether navigating to the next month is disabled.
   */
  readonly disabled: Signal<boolean>;
}

export interface NgpDatePickerNextMonthProps {}

export const [
  NgpDatePickerNextMonthStateToken,
  ngpDatePickerNextMonth,
  injectDatePickerNextMonthState,
  provideDatePickerNextMonthState,
] = createPrimitive(
  'NgpDatePickerNextMonth',
  <T>({}: NgpDatePickerNextMonthProps): NgpDatePickerNextMonthState => {
    const elementRef = injectElementRef<HTMLElement>();
    const dateAdapter = injectDateAdapter<T>();
    const state = injectDateControllerState<T>();

    /**
     * Determine if this is a button element.
     */
    const isButton = elementRef.nativeElement.tagName.toLowerCase() === 'button';

    /**
     * Determine if the next month is disabled.
     */
    const disabled = computed(() => {
      if (state().disabled()) {
        return true;
      }

      const maxDate = state().max();
      const lastDay = dateAdapter.set(dateAdapter.endOfMonth(state().focusedDate()), {
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      });

      // if there is a max date and it is equal to or before the last day of the month, disable it.
      if (maxDate && dateAdapter.compare(maxDate, lastDay) <= 0) {
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
    listener(elementRef, 'click', navigateToNextMonth);

    /**
     * Navigate to the next month.
     */
    function navigateToNextMonth(): void {
      if (disabled()) {
        return;
      }

      const focusedDate = state().focusedDate();
      const day = dateAdapter.getDate(focusedDate);

      // Move to the first day of the next month before restoring the focused day,
      // otherwise a focused date such as the 31st would overflow into the month
      // after next when the next month has fewer days.
      let date = dateAdapter.set(focusedDate, {
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      date = dateAdapter.add(date, { months: 1 });

      // Preserve the focused day, clamping to the last day of the month when the
      // next month is shorter (e.g. 31 May -> 30 June).
      const lastDay = dateAdapter.getDate(dateAdapter.endOfMonth(date));
      date = dateAdapter.set(date, { day: Math.min(day, lastDay) });

      state().setFocusedDate(date, 'mouse', 'forward');
    }

    return { disabled } satisfies NgpDatePickerNextMonthState;
  },
);
