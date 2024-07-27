/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, Directive, ElementRef, HostListener, inject } from '@angular/core';
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
  },
})
export class NgpDatePickerDateButton {
  /**
   * Access the date picker.
   */
  private readonly datePicker = injectDatePicker();

  /**
   * The date this cell represents.
   */
  private readonly date = injectDatePickerCellDate();

  /**
   * Determine if this is the focused date.
   */
  protected readonly focused = computed(() => isSameDay(this.date, this.datePicker.focusedDate()));

  /**
   * Determine if this is the selected date.
   */
  protected readonly selected = computed(() => isSameDay(this.date, this.datePicker.date()));

  /**
   * Determine if this date is outside the current month.
   */
  protected readonly outside = computed(
    () => this.date.getMonth() !== this.datePicker.focusedDate().getMonth(),
  );

  /**
   * Determine if this date is disabled.
   */
  protected readonly disabled = computed(() => {
    if (this.datePicker.disabled()) {
      return true;
    }

    return this.datePicker.dateDisabled()(this.date) || this.outside();
  });

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
  }
}

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) {
    return false;
  }

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
