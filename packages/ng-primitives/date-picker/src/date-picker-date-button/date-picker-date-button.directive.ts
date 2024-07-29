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
import { injectDatePickerCellDate } from '../date-picker-cell/date-picker-cell.token';
import { injectDatePicker } from '../date-picker/date-picker.token';
import { NgpDatePickerDateButtonToken } from './date-picker-date-button.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePickerDateButton]',
  exportAs: 'ngpDatePickerDateButton',
  providers: [{ provide: NgpDatePickerDateButtonToken, useExisting: NgpDatePickerDateButton }],
  host: {
    '[attr.role]': '!isButton ? "button" : null',
    '[attr.tabindex]': 'focused() ? 0 : -1',
    '[attr.data-selected]': 'selected()',
    '[attr.data-disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.data-outside-month]': 'outside()',
    '[attr.data-today]': 'today()',
  },
  hostDirectives: [NgpButton],
})
export class NgpDatePickerDateButton<T> {
  /**
   * Access the date picker.
   */
  private readonly datePicker = injectDatePicker<T>();

  /**
   * Access the date time adapter.
   */
  private readonly dateTimeAdapter = injectDateTimeAdapter();

  /**
   * The date this cell represents.
   */
  private readonly date = injectDatePickerCellDate<T>();

  /**
   * Determine if this is the focused date.
   */
  protected readonly focused = computed(() =>
    this.dateTimeAdapter.isSameDay(this.date, this.datePicker.focusedDate()),
  );

  /**
   * Determine if this is the selected date.
   */
  protected readonly selected = computed(
    () =>
      this.datePicker.date() && this.dateTimeAdapter.isSameDay(this.date, this.datePicker.date()),
  );

  /**
   * Determine if this date is outside the current month.
   */
  protected readonly outside = computed(
    () => !this.dateTimeAdapter.isSameMonth(this.date, this.datePicker.focusedDate()),
  );

  /**
   * Determine if this date is today.
   */
  protected readonly today = computed(() =>
    this.dateTimeAdapter.isSameDay(this.date, this.dateTimeAdapter.now()),
  );

  /**
   * Determine if this date is disabled.
   */
  protected readonly disabled = computed(
    () => this.datePicker.disabled() || this.datePicker.dateDisabled()(this.date),
  );

  /**
   * Get the native element.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Determine if the element is a button.
   */
  protected readonly isButton = this.elementRef.nativeElement.tagName === 'BUTTON';

  /**
   * When the button is clicked, select the date.
   */
  @HostListener('click')
  protected select(): void {
    if (this.disabled()) {
      return;
    }

    this.datePicker.date.set(this.date);
    this.datePicker.focusedDate.set(this.date);
  }
}
