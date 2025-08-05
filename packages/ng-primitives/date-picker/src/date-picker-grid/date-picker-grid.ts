import { computed, Directive } from '@angular/core';
import { injectDateControllerState } from '../date-picker/date-picker-state';

/**
 * The grid that contains the days of the month.
 */
@Directive({
  selector: '[ngpDatePickerGrid]',
  exportAs: 'ngpDatePickerGrid',
  host: {
    role: 'grid',
    '[attr.aria-labelledby]': 'labelId()',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
  },
})
export class NgpDatePickerGrid<T> {
  /**
   * Access the date picker state.
   */
  protected readonly state = injectDateControllerState<T>();

  /**
   * Determine the id for the label.
   */
  protected readonly labelId = computed(() => this.state().label()?.id());
}
