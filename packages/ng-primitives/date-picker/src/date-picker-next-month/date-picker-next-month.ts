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
    ngpButton({ disabled: this.disabled, type: 'button' });
  }

  /**
   * Navigate to the next month.
   */
  @HostListener('click')
  protected navigateToNextMonth(): void {
    // move focus to the first day of the next month.
    let date = this.state().focusedDate();
    date = this.dateAdapter.add(date, { months: 1 });
    date = this.dateAdapter.set(date, {
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    this.state().setFocusedDate(date, 'mouse', 'forward');
  }
}
