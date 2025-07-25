import { computed, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { setupButton } from 'ng-primitives/internal';
import { injectDatePickerState } from '../date-picker/date-picker-state';
import { injectDatePicker } from '../date-picker/date-picker-token';

/**
 * A button that navigates to the next month.
 */
@Directive({
  selector: '[ngpDatePickerNextMonth]',
  exportAs: 'ngpDatePickerNextMonth',
  host: {
    '[attr.aria-disabled]': 'disabled()',
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
    setupButton({ disabled: this.disabled });
  }

  /**
   * Navigate to the next month.
   */
  @HostListener('click')
  protected navigateToNextMonth(): void {
    if (this.disabled()) {
      return;
    }

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

    this.datePicker.setFocusedDate(date, 'mouse', 'forward');
  }
}
