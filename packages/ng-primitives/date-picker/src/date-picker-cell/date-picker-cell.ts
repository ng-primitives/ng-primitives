/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, contentChild, Directive } from '@angular/core';
import { NgpDatePickerDateButtonToken } from '../date-picker-date-button/date-picker-date-button-token';
import { injectDatePicker } from '../date-picker/date-picker-token';
import { NgpDatePickerCellToken } from './date-picker-cell-token';

@Directive({
  selector: '[ngpDatePickerCell]',
  exportAs: 'ngpDatePickerCell',
  providers: [{ provide: NgpDatePickerCellToken, useExisting: NgpDatePickerCell }],
  host: {
    role: 'gridcell',
    '[attr.data-selected]': 'datePickerButton()?.selected() ? "" : null',
    '[attr.aria-selected]': 'datePickerButton()?.selected()',
    '[attr.aria-disabled]': 'datePickerButton()?.disabled()',
    '[attr.data-disabled]': 'datePickerButton()?.disabled() ? "" : null',
    '[attr.aria-labelledby]': 'labelId()',
  },
})
export class NgpDatePickerCell {
  /**
   * Access the date picker.
   */
  private readonly datePicker = injectDatePicker();

  /**
   * Access the child date picker date button.
   */
  protected readonly datePickerButton = contentChild(NgpDatePickerDateButtonToken, {
    descendants: true,
  });

  /**
   * Access the label id.
   */
  protected readonly labelId = computed(() => this.datePicker.label()?.id());
}
