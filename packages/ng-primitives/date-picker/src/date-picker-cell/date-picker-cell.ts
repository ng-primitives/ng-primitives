import { computed, contentChild, Directive } from '@angular/core';
import { NgpDatePickerDateButtonToken } from '../date-picker-date-button/date-picker-date-button-token';
import { injectDatePicker } from '../date-picker/date-picker-token';
import { NgpDatePickerCellToken } from './date-picker-cell-token';

/**
 * A cell in the date picker grid.
 */
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
