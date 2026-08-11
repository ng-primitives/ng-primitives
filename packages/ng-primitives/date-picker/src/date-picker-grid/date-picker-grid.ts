import { Directive } from '@angular/core';
import { ngpDatePickerGrid, provideDatePickerGridState } from './date-picker-grid-state';

/**
 * The grid that contains the days of the month.
 */
@Directive({
  selector: '[ngpDatePickerGrid]',
  exportAs: 'ngpDatePickerGrid',
  providers: [provideDatePickerGridState()],
})
export class NgpDatePickerGrid<T> {
  constructor() {
    ngpDatePickerGrid<T>({});
  }
}
