/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, Directive, HostListener } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectDateTimeAdapter } from 'ng-primitives/date-time';
import { injectDatePicker } from '../date-picker/date-picker.token';
import { NgpDatePickerNextMonthToken } from './date-picker-next-month.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePickerNextMonth]',
  exportAs: 'ngpDatePickerNextMonth',
  providers: [{ provide: NgpDatePickerNextMonthToken, useExisting: NgpDatePickerNextMonth }],
  hostDirectives: [NgpButton],
})
export class NgpDatePickerNextMonth<T> {
  /**
   * Access the date time adapter.
   */
  private readonly dateTimeAdapter = injectDateTimeAdapter<T>();

  /**
   * Access the date picker.
   */
  private readonly datePicker = injectDatePicker<T>();

  /**
   * Determine if the next month is disabled.
   */
  protected readonly disabled = computed(() => {
    if (this.datePicker.disabled()) {
      return true;
    }

    // TODO: Implement the logic to determine if the next month is disabled.

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

    this.datePicker.focusedDate.set(date);
  }
}
