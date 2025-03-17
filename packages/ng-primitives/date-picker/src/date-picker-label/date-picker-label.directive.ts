/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectDatePicker } from '../date-picker/date-picker.token';
import { NgpDatePickerLabelToken } from './date-picker-label.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePickerLabel]',
  exportAs: 'ngpDatePickerLabel',
  providers: [{ provide: NgpDatePickerLabelToken, useExisting: NgpDatePickerLabel }],
  host: {
    '[id]': 'id()',
    '[attr.aria-live]': 'ariaLive()',
    '[attr.data-disabled]': 'datePicker.state.disabled() ? "" : null',
  },
})
export class NgpDatePickerLabel {
  /**
   * Access the date picker.
   */
  protected readonly datePicker = injectDatePicker<unknown>();

  /**
   * Define a unique id for the label.
   */
  readonly id = input(uniqueId('ngp-date-picker-label'));

  /**
   * Define the aria live attribute.
   */
  readonly ariaLive = input('polite', {
    alias: 'aria-live',
  });
}
