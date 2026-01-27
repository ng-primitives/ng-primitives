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
   * Determine if the previous month is disabled.
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
    ngpButton({ disabled: this.disabled, type: 'button' });
  }

  /**
   * Navigate to the previous month.
   */
  @HostListener('click')
  protected navigateToPreviousMonth(): void {
    // move focus to the first day of the previous month.
    let date = this.state().focusedDate();
    date = this.dateAdapter.set(date, {
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    date = this.dateAdapter.subtract(date, { months: 1 });

    this.state().setFocusedDate(date, 'mouse', 'backward');
  }
}
