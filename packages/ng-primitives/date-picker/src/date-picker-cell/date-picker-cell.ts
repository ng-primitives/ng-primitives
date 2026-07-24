import { contentChild, Directive } from '@angular/core';
import { NgpDatePickerDateButtonToken } from '../date-picker-date-button/date-picker-date-button-token';
import { ngpDatePickerCell, provideDatePickerCellState } from './date-picker-cell-state';

/**
 * A cell in the date picker grid.
 */
@Directive({
  selector: '[ngpDatePickerCell]',
  exportAs: 'ngpDatePickerCell',
  providers: [provideDatePickerCellState()],
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

  /**
   * The date picker cell state.
   */
  protected readonly state = ngpDatePickerCell({ button: this.datePickerButton });
}
