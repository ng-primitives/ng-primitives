/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, contentChild, Directive, input, model } from '@angular/core';
import { injectDateTimeAdapter } from 'ng-primitives/date-time';
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
}
