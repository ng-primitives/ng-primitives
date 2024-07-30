/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  afterNextRender,
  booleanAttribute,
  contentChild,
  contentChildren,
  Directive,
  inject,
  Injector,
  input,
  model,
} from '@angular/core';
import { injectDateTimeAdapter } from 'ng-primitives/date-time';
import { NgpDatePickerDateButtonToken } from '../date-picker-date-button/date-picker-date-button.token';
import { NgpDatePickerLabelToken } from '../date-picker-label/date-picker-label.token';
import { NgpDatePickerToken } from './date-picker.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePicker]',
  exportAs: 'ngpDatePicker',
  providers: [{ provide: NgpDatePickerToken, useExisting: NgpDatePicker }],
})
export class NgpDatePicker<T> {
  /**
   * Access the date time adapter.
   */
  private readonly dateTimeAdapter = injectDateTimeAdapter<T>();

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * The minimum date that can be selected.
   */
  readonly min = input<T | undefined>(undefined, {
    alias: 'ngpDatePickerMin',
  });

  /**
   * The maximum date that can be selected.
   */
  readonly max = input<T | undefined>(undefined, {
    alias: 'ngpDatePickerMax',
  });

  /**
   * Determine if the date picker is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpDatePickerDisabled',
    transform: booleanAttribute,
  });

  /**
   * A function that is called to determine if a specific date should be disabled.
   */
  readonly dateDisabled = input<(date: T) => boolean>(() => false, {
    alias: 'ngpDatePickerDateDisabled',
  });

  /**
   * The selected value.
   */
  readonly date = model<T | undefined>(undefined, {
    alias: 'ngpDatePickerDate',
  });

  /**
   * The focused value.
   */
  readonly focusedDate = model<T>(this.dateTimeAdapter.now(), {
    alias: 'ngpDatePickerFocusedDate',
  });

  /**
   * Detect the label element.
   * @internal
   */
  readonly label = contentChild(NgpDatePickerLabelToken, { descendants: true });

  /**
   * Access all the date picker buttons
   */
  private readonly buttons = contentChildren(NgpDatePickerDateButtonToken, { descendants: true });

  /**
   * Set the focused date.
   * @param date The date to focus.
   * @internal
   */
  setFocusedDate(date: T, origin: FocusOrigin = 'mouse', direction: 'forward' | 'backward'): void {
    if (this.disabled()) {
      return;
    }

    const min = this.min();
    const max = this.max();

    if (min && this.dateTimeAdapter.isBefore(date, min)) {
      date = min;
    }

    if (max && this.dateTimeAdapter.isAfter(date, max)) {
      date = max;
    }

    // if the date is disabled, find the next available date in the specified direction.
    if (this.dateDisabled()(date)) {
      let nextDate = this.dateTimeAdapter.add(date, { days: direction === 'forward' ? 1 : -1 });

      while (
        this.dateDisabled()(nextDate) ||
        (min && this.dateTimeAdapter.isBefore(nextDate, min)) ||
        (max && this.dateTimeAdapter.isAfter(nextDate, max))
      ) {
        nextDate = this.dateTimeAdapter.add(nextDate, { days: direction === 'forward' ? 1 : -1 });
      }

      date = nextDate;
    }

    this.focusedDate.set(date);

    if (origin === 'keyboard') {
      afterNextRender(
        {
          write: () => {
            this.buttons().forEach(button => button.focus());
          },
        },
        {
          injector: this.injector,
        },
      );
    }
  }
}