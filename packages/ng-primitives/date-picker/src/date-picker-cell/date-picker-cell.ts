import { contentChild, Directive } from '@angular/core';
import { NgpDatePickerDateButtonToken } from '../date-picker-date-button/date-picker-date-button-token';

/**
 * A cell in the date picker grid.
 */
@Directive({
  selector: '[ngpDatePickerCell]',
  exportAs: 'ngpDatePickerCell',
  host: {
    role: 'gridcell',
    '[attr.data-selected]': 'datePickerButton()?.selected() ? "" : null',
    '[attr.aria-selected]': 'datePickerButton()?.selected()',
    '[attr.aria-disabled]': 'datePickerButton()?.disabled()',
    '[attr.data-disabled]': 'datePickerButton()?.disabled() ? "" : null',
  },
})
export class NgpDatePickerCell {
  /**
   * Access the child date picker date button.
   * The cell's accessible name comes from this button's day content, not the
   * shared month/year label (which would make every cell announce the month).
   */
  protected readonly datePickerButton = contentChild(NgpDatePickerDateButtonToken, {
    descendants: true,
  });
}
