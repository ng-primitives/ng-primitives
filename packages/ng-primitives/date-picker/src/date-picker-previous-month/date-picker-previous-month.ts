import { computed, Directive } from '@angular/core';
import {
  ngpDatePickerPreviousMonth,
  provideDatePickerPreviousMonthState,
} from './date-picker-previous-month-state';

/**
 * A button that navigates to the previous month.
 */
@Directive({
  selector: '[ngpDatePickerPreviousMonth]',
  exportAs: 'ngpDatePickerPreviousMonth',
  providers: [provideDatePickerPreviousMonthState()],
})
export class NgpDatePickerPreviousMonth<T> {
  /**
   * The previous month state.
   */
  protected readonly state = ngpDatePickerPreviousMonth<T>({});

  /**
   * Determine if the previous month is disabled.
   * @internal
   */
  readonly disabled = computed(() => this.state.disabled());
}
