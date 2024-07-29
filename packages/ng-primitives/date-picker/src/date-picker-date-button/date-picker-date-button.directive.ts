/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusMonitor } from '@angular/cdk/a11y';
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
   * Access the focus monitor.
   */
  private readonly focusMonitor = inject(FocusMonitor);

  /**
   * Access the date picker.
   */
  private readonly datePicker = injectDatePicker<T>();

  /**
   * Access the date time adapter.
   */
  private readonly dateTimeAdapter = injectDateTimeAdapter<T>();

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
  protected readonly selected = computed(() => {
    const selected = this.datePicker.date();
    return selected && this.dateTimeAdapter.isSameDay(this.date, selected);
  });

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
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  protected select(event?: KeyboardEvent): void {
    // if the button is disabled, or is already selected, do nothing.
    if (this.disabled() || this.selected()) {
      return;
    }

    // because this may not be a button, we should stop the event from firing twice due to
    // us listening to both the click and the keydown.enter event.
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.datePicker.date.set(this.date);
    this.datePicker.setFocusedDate(this.date);
  }

  /**
   * Focus if this is the current focused date.
   * @internal
   */
  focus(): void {
    if (this.dateTimeAdapter.isSameDay(this.date, this.datePicker.focusedDate())) {
      this.focusMonitor.focusVia(this.elementRef, 'keyboard');
    }
  }

  /**
   * Focus the previous cell.
   */
  @HostListener('keydown.arrowLeft', ['$event'])
  protected focusPrevious(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // TODO: bidi support
    this.focusDate(this.dateTimeAdapter.subtract(this.datePicker.focusedDate(), { days: 1 }));
  }

  /**
   * Focus the next cell.
   */
  @HostListener('keydown.arrowRight', ['$event'])
  protected focusNext(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // TODO: bidi support

    this.focusDate(this.dateTimeAdapter.add(this.datePicker.focusedDate(), { days: 1 }));
  }

  /**
   * Focus the above cell.
   */
  @HostListener('keydown.arrowUp', ['$event'])
  protected focusAbove(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.focusDate(this.dateTimeAdapter.subtract(this.datePicker.focusedDate(), { days: 7 }));
  }

  /**
   * Focus the below cell.
   */
  @HostListener('keydown.arrowDown', ['$event'])
  protected focusBelow(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.focusDate(this.dateTimeAdapter.add(this.datePicker.focusedDate(), { days: 7 }));
  }

  private focusDate(date: T): void {
    // TODO: check if the date is disabled or before the min date or after the max date
    this.datePicker.setFocusedDate(date, 'keyboard');
  }
}
