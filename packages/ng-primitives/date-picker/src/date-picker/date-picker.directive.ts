/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, contentChild, Directive, input, model } from '@angular/core';
import { NgpDatePickerLabelToken } from '../date-picker-label/date-picker-label.token';
import { NgpDatePickerToken } from './date-picker.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePicker]',
  exportAs: 'ngpDatePicker',
  providers: [{ provide: NgpDatePickerToken, useExisting: NgpDatePicker }],
})
export class NgpDatePicker {
  /**
   * The minimum date that can be selected.
   */
  readonly min = input<Date | undefined>(undefined, {
    alias: 'ngpDatePickerMin',
  });

  /**
   * The maximum date that can be selected.
   */
  readonly max = input<Date | undefined>(undefined, {
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
  readonly dateDisabled = input<(date: Date) => boolean>(() => false, {
    alias: 'ngpDatePickerDateDisabled',
  });

  /**
   * The selected value.
   */
  readonly date = model<Date | undefined>(undefined, {
    alias: 'ngpDatePickerDate',
  });

  /**
   * The focused value.
   */
  readonly focusedDate = input<Date>(new Date(), {
    alias: 'ngpDatePickerFocusedDate',
  });

  /**
   * Detect the label element.
   * @internal
   */
  readonly label = contentChild(NgpDatePickerLabelToken, { descendants: true });
}
