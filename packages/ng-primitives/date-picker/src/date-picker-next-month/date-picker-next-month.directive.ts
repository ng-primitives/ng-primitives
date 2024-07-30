/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectDateTimeAdapter } from 'ng-primitives/date-time';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectDatePicker } from '../date-picker/date-picker.token';
import { NgpDatePickerNextMonthToken } from './date-picker-next-month.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePickerNextMonth]',
  exportAs: 'ngpDatePickerNextMonth',
  providers: [
    { provide: NgpDatePickerNextMonthToken, useExisting: NgpDatePickerNextMonth },
    { provide: NgpDisabledToken, useExisting: NgpDatePickerNextMonth },
  ],
  hostDirectives: [NgpButton],
  host: {
    '[attr.data-disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.disabled]': 'isButton && disabled() ? true : null',
    '[attr.type]': 'isButton ? "button" : null',
  },
})
export class NgpDatePickerNextMonth<T> implements NgpCanDisable {
  /**
   * Access the element ref.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the date time adapter.
   */
  private readonly dateTimeAdapter = injectDateTimeAdapter<T>();

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

    const maxDate = this.datePicker.max();
    const lastDay = this.dateTimeAdapter.set(
      this.dateTimeAdapter.endOfMonth(this.datePicker.focusedDate()),
      {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      },
    );

    // if there is a max date and it is equal to or before the last day of the month, disable it.
    if (maxDate && this.dateTimeAdapter.compare(maxDate, lastDay) <= 0) {
      return true;
    }

    return false;
  });

  /**
   * Navigate to the next month.
   */
  @HostListener('click')
  protected navigateToNextMonth(): void {
    if (this.disabled()) {
      return;
    }

    // move focus to the first day of the next month.
    let date = this.datePicker.focusedDate();
    date = this.dateTimeAdapter.add(date, { months: 1 });
    date = this.dateTimeAdapter.set(date, {
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    this.datePicker.setFocusedDate(date, 'mouse', 'forward');
  }
}
