import { computed, Directive } from '@angular/core';
import {
  ngpDatePickerDateButton,
  provideDatePickerDateButtonState,
} from './date-picker-date-button-state';
import { NgpDatePickerDateButtonToken } from './date-picker-date-button-token';

/**
 * A button that represents a date in the date picker grid.
 */
@Directive({
  selector: '[ngpDatePickerDateButton]',
  exportAs: 'ngpDatePickerDateButton',
  providers: [
    provideDatePickerDateButtonState(),
    { provide: NgpDatePickerDateButtonToken, useExisting: NgpDatePickerDateButton },
  ],
})
export class NgpDatePickerDateButton<T> {
  /**
   * The date button state.
   */
  protected readonly state = ngpDatePickerDateButton<T>({});

  /**
   * Determine if this is the selected date.
   * @internal
   */
  readonly selected = computed(() => this.state.selected());

  /**
   * Determine if this date is disabled.
   * @internal
   */
  readonly disabled = computed(() => this.state.disabled());
}
