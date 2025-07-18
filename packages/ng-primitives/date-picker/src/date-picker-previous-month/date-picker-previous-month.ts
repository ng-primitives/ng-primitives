import { computed, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { setupButton } from 'ng-primitives/internal';
import { injectDatePickerState } from '../date-picker/date-picker-state';
import { injectDatePicker } from '../date-picker/date-picker-token';

/**
 * A button that navigates to the previous month.
 */
@Directive({
  selector: '[ngpDatePickerPreviousMonth]',
  exportAs: 'ngpDatePickerPreviousMonth',
  host: {
    '[attr.aria-disabled]': 'disabled()',
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
   * Access the date picker.
   */
  private readonly datePicker = injectDatePicker<T>();

  /**
   * Access the date picker state.
   */
  private readonly state = injectDatePickerState<T>();

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
    setupButton({ disabled: this.disabled });
  }

  /**
   * Navigate to the previous month.
   */
  @HostListener('click')
  protected navigateToPreviouMonth(): void {
    if (this.disabled()) {
      return;
    }

    // move focus to the first day of the previous month.
    let date = this.state().focusedDate();
    date = this.dateAdapter.subtract(date, { months: 1 });
    date = this.dateAdapter.set(date, {
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    this.datePicker.setFocusedDate(date, 'mouse', 'backward');
  }
}
