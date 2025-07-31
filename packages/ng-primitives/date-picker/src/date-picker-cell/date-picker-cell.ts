import { computed, contentChild, Directive } from '@angular/core';
import { NgpDatePickerDateButtonToken } from '../date-picker-date-button/date-picker-date-button-token';
import { injectDatePickerState } from '../date-picker/date-picker-state';

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
    '[attr.aria-labelledby]': 'labelId()',
  },
})
export class NgpDatePickerCell {
  /**
   * Access the date picker.
   */
  private readonly state = injectDatePickerState();

  /**
   * Access the child date picker date button.
   */
  protected readonly datePickerButton = contentChild(NgpDatePickerDateButtonToken, {
    descendants: true,
  });

  /**
   * Access the label id.
   */
  protected readonly labelId = computed(() => this.state().label()?.id());
}
