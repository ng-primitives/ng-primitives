import { computed, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { injectDateControllerState } from '../date-picker/date-picker-state';

/**
 * A button that navigates to the previous month.
 */
@Directive({
  selector: '[ngpDatePickerPreviousMonth]',
  exportAs: 'ngpDatePickerPreviousMonth',
  host: {
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.type]': 'isButton ? "button" : null',
  },
})
export class NgpDatePickerPreviousMonth<T> {
  /**
   * Access the element ref.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the date adapter.
   */
  private readonly dateAdapter = injectDateAdapter<T>();

  /**
   * Access the date picker state.
   */
  private readonly state = injectDateControllerState<T>();

  /**
   * Determine if this is a button element
   */
  protected readonly isButton = this.elementRef.nativeElement.tagName.toLowerCase() === 'button';

  /**
   * Determine if the next month is disabled.
   * @internal
   */
  readonly disabled = computed(() => {
    if (this.state().disabled()) {
      return true;
    }

    const minDate = this.state().min();

    // if the next month is out of bounds, disable it.
    const firstDay = this.dateAdapter.set(
      this.dateAdapter.startOfMonth(this.state().focusedDate()),
      {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      },
    );

    // if there is a min date and it is equal to or after the first day of the month, disable it.
    if (minDate && this.dateAdapter.compare(minDate, firstDay) >= 0) {
      return true;
    }

    return false;
  });

  constructor() {
    ngpButton({ disabled: this.disabled });
  }

  /**
   * Navigate to the previous month.
   */
  @HostListener('click')
  protected navigateToPreviouMonth(): void {
    if (this.disabled()) {
      return;
    }

    const focusedDate = this.state().focusedDate();
    const day = this.dateAdapter.getDate(focusedDate);

    // Move to the first day of the previous month before restoring the focused
    // day, otherwise a focused date such as the 31st would overflow when the
    // previous month has fewer days.
    let date = this.dateAdapter.set(focusedDate, {
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    date = this.dateAdapter.subtract(date, { months: 1 });

    // Preserve the focused day, clamping to the last day of the month when the
    // previous month is shorter (e.g. 31 March -> 28 February).
    const lastDay = this.dateAdapter.getDate(this.dateAdapter.endOfMonth(date));
    date = this.dateAdapter.set(date, { day: Math.min(day, lastDay) });

    this.state().setFocusedDate(date, 'mouse', 'backward');
  }
}
