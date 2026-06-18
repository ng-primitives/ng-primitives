import { computed, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { injectDateControllerState } from '../date-picker/date-picker-state';

/**
 * A button that navigates to the next month.
 */
@Directive({
  selector: '[ngpDatePickerNextMonth]',
  exportAs: 'ngpDatePickerNextMonth',
  host: {
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.type]': 'isButton ? "button" : null',
  },
})
export class NgpDatePickerNextMonth<T> {
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

    const maxDate = this.state().max();
    const lastDay = this.dateAdapter.set(this.dateAdapter.endOfMonth(this.state().focusedDate()), {
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    });

    // if there is a max date and it is equal to or before the last day of the month, disable it.
    if (maxDate && this.dateAdapter.compare(maxDate, lastDay) <= 0) {
      return true;
    }

    return false;
  });

  constructor() {
    ngpButton({ disabled: this.disabled });
  }

  /**
   * Navigate to the next month.
   */
  @HostListener('click')
  protected navigateToNextMonth(): void {
    if (this.disabled()) {
      return;
    }

    const focusedDate = this.state().focusedDate();
    const day = this.dateAdapter.getDate(focusedDate);

    // Move to the first day of the next month before restoring the focused day,
    // otherwise a focused date such as the 31st would overflow into the month
    // after next when the next month has fewer days.
    let date = this.dateAdapter.set(focusedDate, {
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    date = this.dateAdapter.add(date, { months: 1 });

    // Preserve the focused day, clamping to the last day of the month when the
    // next month is shorter (e.g. 31 May -> 30 June).
    const lastDay = this.dateAdapter.getDate(this.dateAdapter.endOfMonth(date));
    date = this.dateAdapter.set(date, { day: Math.min(day, lastDay) });

    this.state().setFocusedDate(date, 'mouse', 'forward');
  }
}
