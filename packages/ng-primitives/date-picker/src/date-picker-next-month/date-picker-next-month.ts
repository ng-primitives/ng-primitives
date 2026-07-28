import { computed, Directive } from '@angular/core';
import {
  ngpDatePickerNextMonth,
  provideDatePickerNextMonthState,
} from './date-picker-next-month-state';

/**
 * A button that navigates to the next month.
 */
@Directive({
  selector: '[ngpDatePickerNextMonth]',
  exportAs: 'ngpDatePickerNextMonth',
  providers: [provideDatePickerNextMonthState()],
})
export class NgpDatePickerNextMonth<T> {
  /**
   * The next month state.
   */
  protected readonly state = ngpDatePickerNextMonth<T>({});

  /**
   * Determine if the next month is disabled.
   * @internal
   */
  readonly disabled = computed(() => this.state.disabled());
}
