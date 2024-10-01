/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectDatePicker } from '../date-picker/date-picker.token';
import { NgpDatePickerPreviousMonthToken } from './date-picker-previous-month.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePickerPreviousMonth]',
  exportAs: 'ngpDatePickerPreviousMonth',
  providers: [
    { provide: NgpDatePickerPreviousMonthToken, useExisting: NgpDatePickerPreviousMonth },
    { provide: NgpDisabledToken, useExisting: NgpDatePickerPreviousMonth },
  ],
  hostDirectives: [NgpButton],
  host: {
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.disabled]': 'isButton && disabled() ? true : null',
    '[attr.type]': 'isButton ? "button" : null',
  },
})
export class NgpDatePickerPreviousMonth<T> implements NgpCanDisable {
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
   * Determine if this is a button element
   */
  protected readonly isButton = this.elementRef.nativeElement.tagName.toLowerCase() === 'button';

  /**
   * Determine if the next month is disabled.
   * @internal
   */
  readonly disabled = computed(() => {
    if (this.datePicker.disabled()) {
      return true;
    }

    const minDate = this.datePicker.min();

    // if the next month is out of bounds, disable it.
    const firstDay = this.dateAdapter.set(
      this.dateAdapter.startOfMonth(this.datePicker.focusedDate()),
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

  /**
   * Navigate to the previous month.
   */
  @HostListener('click')
  protected navigateToPreviouMonth(): void {
    if (this.disabled()) {
      return;
    }

    // move focus to the first day of the previous month.
    let date = this.datePicker.focusedDate();
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
